const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const {
  uploadImage,
  deleteImageFromCloudinary,
} = require("../utilis/uploadImage");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 10 });

async function createBlog(req, res) {
  try {
    const { image, images } = req.files;
    const creator = req.user;
    const { title, description } = req.body;
    const draft = req.body.draft == "false" ? false : true;
    const content = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);

    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, description and content are required",
      });
    }

    const user = await User.findById(creator);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let imageIndex = 0;
    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];
      if (block.type === "image") {
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
            "base64"
          )}`
        );
        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };

        imageIndex++;
      }
    }
    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`
    );

    const blogId = title.toLowerCase().replace(/ +/g, "-") + randomUUID();

    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,
      tags,
    });

    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

    if (draft) {
      return res.status(200).json({
        message: "Blog Saved as Draft. You can public it from your profile",
        blog,
      });
    }
    return res
      .status(201)
      .json({ success: true, message: "Blog created successfully", blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function retriveBlog(req, res) {
  const { id: blogId } = req.params;

  const blog = await Blog.findOne({ blogId })
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name email username profilePic",
      },
    })
    .populate({
      path: "creator",
      select: "name email followers username profilePic",
    });

  async function populateReplies(comments) {
    for (const comment of comments) {
      let populatedComment = await Comment.findById(comment._id)
        .populate({
          path: "replies",
          populate: {
            path: "user",
            select: "name email username profilePic",
          },
        })
        .lean();

      comment.replies = populatedComment.replies;

      if (comment.replies && comment.replies.length > 0) {
        await populateReplies(comment.replies);
      }
    }
    return comments;
  }

  if (!blog) return res.status(404).json({ message: "Blog Not Found" });

  blog.comments = await populateReplies(blog.comments);

  return res.status(200).json({
    message: "Blog fetched successfully",
    blog,
    currentUserId: req.user,
  });
}

async function retriveAllBlog(req, res) {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ draft: false })
      .populate({ path: "creator", select: "-password" })
      .populate({ path: "likes", select: "email name" })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments({ draft: false });

    return res.status(200).json({ blogs, hashMore: skip + limit < totalBlogs });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function updateBlog(req, res) {
  try {
    const creator = req.user;
    const { id } = req.params;
    const { title, description } = req.body;
    const draft = req.body.draft == "false" ? false : true;
    const content = req.body.content
      ? JSON.parse(req.body.content)
      : { blocks: [] };

    const tags = JSON.parse(req.body.tags);
    const existingImages = JSON.parse(req.body.existingImages || "[]");

    const blog = await Blog.findOne({ blogId: id });

    if (!blog || String(blog.creator) !== String(creator)) {
      return res.status(400).json({
        success: false,
        message: "Not authorized to update this blog",
      });
    }

    const previousBlocks =
      blog.content && Array.isArray(blog.content.blocks)
        ? blog.content.blocks
        : [];

    let imagesToDelete = previousBlocks
      .filter((block) => block.type == "image")
      .filter(
        (block) => !existingImages.find(({ url }) => url == block.data.file.url)
      )
      .map((block) => block.data.file.imageId);

    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map((id) => deleteImageFromCloudinary(id))
      );
    }

    if (req.files.images) {
      let imageIndex = 0;
      for (let i = 0; i < content.blocks.length; i++) {
        const block = content.blocks[i];
        if (block.type === "image" && block.data.file.image) {
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${req.files.images[
              imageIndex
            ].buffer.toString("base64")}`
          );
          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };

          imageIndex++;
        }
      }
    }

    if (req.files.image) {
      await deleteImageFromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${req.files.image[0].buffer.toString("base64")}`
      );

      blog.image = secure_url;
      blog.imageId = public_id;
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.draft = draft;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    await blog.save();
    if (draft) {
      return res.status(200).json({
        message:
          "Blog Saved as Draft. You can again public it from your profile page",
        blog,
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Blog updated", blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    const creator = req.user;
    const blog = await Blog.findById(id);

    if (!blog || String(blog.creator) !== String(creator)) {
      return res
        .status(400)
        .json({ success: false, message: "Not authorized to delete" });
    }

    await deleteImageFromCloudinary(blog.imageId);
    await Blog.findByIdAndDelete(id);
    await User.findByIdAndUpdate(creator, { $pull: { blogs: id } });

    return res.status(200).json({ message: "Blog deleted", blog });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function likeBlog(req, res) {
  try {
    const { id } = req.params;
    const creator = req.user;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const action1 = blog.likes.includes(creator)
      ? { $pull: { likes: creator } }
      : { $push: { likes: creator } };

    const action2 = blog.likes.includes(creator)
      ? { $pull: { likeBlogs: id } }
      : { $push: { likeBlogs: id } };

    await Blog.findByIdAndUpdate(id, action1);
    await User.findByIdAndUpdate(creator, action2);

    return res.status(200).json({
      success: true,
      message: blog.likes.includes(creator) ? "Disliked" : "Liked",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function saveBlog(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(500).json({
        message: "Blog is not found",
      });
    }

    if (!blog.totalSaves.includes(user)) {
      await Blog.findByIdAndUpdate(id, { $set: { totalSaves: user } });
      await User.findByIdAndUpdate(user, { $set: { saveBlogs: id } });
      return res.status(200).json({
        success: true,
        message: "Blog has been saved",
        isLiked: true,
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $unset: { totalSaves: user } });
      await User.findByIdAndUpdate(user, { $unset: { saveBlogs: id } });
      return res.status(200).json({
        success: true,
        message: "Blog Unsaved",
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function searchBlogs(req, res) {
  try {
    const { search, tag } = req.query;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    let query;

    if (tag) {
      query = {tags:tag}
    } else {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const blogs = await Blog.find(query, { draft: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(query, { draft: false });

    if (blogs.length == 0) {
      return res.status(400).json({
        success: false,
        message:
          "Make sure all words are spelled correctly try more different keywords and general words",
          hashMore: false
      });
    }
    return res.status(200).json({
      success: true,
      blogs,
      hashMore: skip + limit < totalBlogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  createBlog,
  retriveBlog,
  retriveAllBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog,
  searchBlogs,
};
