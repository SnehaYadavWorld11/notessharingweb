import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Comment from "../components/Comment";
import {
  addSelectedBlog,
  removeSelectedBlog,
} from "../utils/selectedBlogSlice";
import { setIsOpen } from "../utils/commentSlice";
import { formDate } from "../utils/formatDate";

export async function handleSaveBlogs(id, token) {
  try {
    let res = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/save-blog/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success(res.data.message);
  } catch (error) {
    toast.error(error.response.data.message);
  }
}

export async function handleFollowCreator(id, token) {
  try {
    let res = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/follow/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success(res.data.message);
  } catch (error) {
    toast.error(error.response.data.message);
  }
}

const BlogPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    token,
    email,
    id: userId,
    profilePic,
  } = useSelector((state) => state.user);
  const { comments, content } = useSelector((state) => state.selectedBlog);
  const { isOpen } = useSelector((state) => state.comment);
  const [blogData, setBlogData] = useState(null);
  const [follow, setfollow] = useState(false);
  const [like, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState();

  async function fetchBlogById() {
    try {
      let {
        data: { blog },
      } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
      setBlogData(blog);
      setLikeCount(blog.likes.length);
      if (blog.likes.includes(userId)) {
        setLike((prev) => !prev);
      }
      dispatch(addSelectedBlog(blog));
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLike() {
    if (token) {
      setLike((prev) => !prev);
      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.message == "Liked") {
        setLikeCount((prev) => prev + 1);
      } else {
        setLikeCount((prev) => prev - 1);
      }
      toast.success(res.data.message);
    } else {
      return toast.error("Please Sign in to LIKE this blog");
    }
  }

  useEffect(() => {
    fetchBlogById();
    return () => {
      dispatch(setIsOpen(false));
      if (window.location.pathname != `/edit/${id}`) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id]);
  

return (
    <div className="flex justify-center w-full ">
      <div className="w-full max-w-3xl px-4 sm:px-6">
        {blogData ? (
          <div className="flex flex-col items-start">
            {/* Blog Title */}
            <h1 className="mt-6 sm:mt-10 font-semibold text-2xl sm:text-3xl md:text-4xl">
              {blogData.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center my-4 sm:my-5 gap-3 w-full">
              <Link to={`/@${blogData.creator.username}`} className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer">
                  <img
                    src={
                      blogData.creator.profilePic ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${blogData.creator.name}`
                    }
                    alt={blogData.creator.name}
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex flex-col flex-grow min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <Link 
                    to={`/@${blogData.creator.username}`} 
                    className="hover:underline text-base sm:text-lg md:text-xl"
                  >
                    {blogData.creator.name}
                  </Link>
                  <span>·</span>
                  <button
                    onClick={() => handleFollowCreator(blogData.creator._id, token)}
                    className="text-sm sm:text-base font-medium text-green-700 cursor-pointer hover:text-green-800"
                  >
                    {blogData?.creator?.followers?.includes(userId) ? "Following" : "Follow"}
                  </button>
                </div>
                <div className="flex flex-wrap text-sm sm:text-base text-gray-600">
                  <span>6 min read</span>
                  <span className="mx-2">·</span>
                  <span>{formDate(blogData.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Featured Image - Responsive with proper sizing */}
            {blogData.image && (
              <div className="w-full my-4">
                <img
                  src={blogData.image}
                  alt={blogData.title}
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
              </div>
            )}

            {/* Edit Button */}
            {token && email === blogData.creator.email && (
              <Link 
                to={"/edit/" + blogData.blogId} 
                className="w-full sm:w-auto mt-3 sm:mt-4"
              >
                <button className="bg-green-500 w-full sm:w-32 h-10 rounded-lg text-white hover:bg-green-600 transition-colors">
                  Edit
                </button>
              </Link>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 sm:gap-6 md:gap-8 mt-4 w-full justify-between sm:justify-start">
              <div className="flex gap-1 sm:gap-2 items-center">
                <button onClick={handleLike} className="focus:outline-none">
                  {like ? (
                    <i className="fi fi-sr-circle-heart text-red-500 text-2xl sm:text-3xl"></i>
                  ) : (
                    <i className="fi fi-ts-circle-heart text-black text-2xl sm:text-3xl"></i>
                  )}
                </button>
                <p className="text-lg sm:text-xl text-gray-500">{likeCount}</p>
              </div>
              
              <div className="flex gap-1 sm:gap-2 items-center">
                <button 
                  onClick={() => dispatch(setIsOpen())} 
                  className="focus:outline-none"
                >
                  <i className="fi fi-sr-comment-alt text-gray-600 text-2xl sm:text-3xl"></i>
                </button>
                <p className="text-lg sm:text-xl text-gray-500">{comments?.length}</p>
              </div>
              
              <button
                onClick={(e) => handleSaveBlogs(blogData._id, token)}
                className="focus:outline-none"
              >
                {blogData?.totalSaves?.includes(userId) ? (
                  <i className="fi fi-sr-bookmark text-gray-600 text-2xl sm:text-3xl"></i>
                ) : (
                  <i className="fi fi-br-bookmark text-gray-600 text-2xl sm:text-3xl"></i>
                )}
              </button>
            </div>

            {/* Blog Content */}
            {content && (
              <div className="my-6 sm:my-8 w-full">
                {content.blocks.map((block, index) => {
                  if (block.type === "header") {
                    const level = block.data.level;
                    const HeaderTag = `h${level}`;
                    return (
                      <HeaderTag
                        key={index}
                        className={`font-bold ${
                          level === 2 
                            ? "text-xl sm:text-2xl my-3 sm:my-4" 
                            : level === 3 
                              ? "text-lg sm:text-xl my-2 sm:my-3" 
                              : "text-base sm:text-lg my-2"
                        }`}
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                      />
                    );
                  } else if (block.type === "paragraph") {
                    return (
                      <p
                        key={index}
                        className="my-3 sm:my-4 text-base sm:text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                      />
                    );
                  } else if (block.type === "image") {
                    return (
          <div key={index} className="my-6 w-full flex justify-center">
            <div className="w-full max-w-2xl"> {/* Container to limit width on large screens */}
              <img 
                src={block.data.file.url} 
                alt={block.data.caption || "Blog image"} 
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg mx-auto"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
              {block.data.caption && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {block.data.caption}
                </p>
              )}
            </div>
          </div>
        );
      }
      return null;
    })}
  </div>
)}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <h1 className="text-xl">Loading...</h1>
          </div>
        )}
        {isOpen && <Comment />}
      </div>
    </div>
  );
};

export default BlogPage;
