import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import { setIsOpen } from "../utils/commentSlice";
import { removeSelectedBlog } from "../utils/selectedBlogSlice";

const AddBlogPage = () => {
  const { id } = useParams();
  const editorjsRef = useRef(null);
  const { token } = useSelector((slice) => slice.user);
  const {
    title: initialTitle,
    description: initialDesc,
    image: initialImage,
    content,
    draft,
    tags
  } = useSelector((slice) => slice.selectedBlog);


  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
    tags: [],
    draft: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handlePostBlog() {
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("draft",blogData.draft)
    formData.append("content", JSON.stringify(blogData.content));
    formData.append("tags",JSON.stringify(blogData.tags))

    blogData.content.blocks.forEach((block) => {
      if (block.type === "image") {
        formData.append("images", block.data.file.image);
      }
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  async function handleUpdateBlog() {
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("content", JSON.stringify(blogData.content));
    formData.append("tags",JSON.stringify(blogData.tags))
    formData.append("draft",blogData.draft)


    let existingImages = [];
    blogData.content.blocks.forEach((block) => {
      if (block.type === "image") {
        if (block.data.file.image) {
          formData.append("images", block.data.file.image);
        } else {
          existingImages.push({
            url: block.data.file.url,
            imageId: block.data.file.imageId,
          });
        }
      }
    });

    formData.append("existingImages", JSON.stringify(existingImages));

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  }

  function initializedEditorJS() {
    if (editorjsRef.current) return;

    editorjsRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Write Something Here...",
      data: content,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a Header",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        List: {
          class: List,
          config: {},
          inlineToolbar: true,
        },
        CodeTool: CodeTool,
        Marker: Marker,
        Underline: Underline,
        Embed: Embed,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => {
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(image),
                    image,
                  },
                };
              },
            },
          },
        },
      },
      onChange: async () => {
        const data = await editorjsRef.current.save();
        setBlogData((blogData) => ({ ...blogData, content: data }));
      },
    });
  }

  function deleteTag(index) {
    const updatedTags = blogData.tags.filter(
      (_, tagIndex) => tagIndex !== index
    );
    setBlogData((prev) => ({ ...prev, tags: updatedTags }));
  }

  function handleKeyDown(e) {
    const tag = e.target.value.toLowerCase();
    if (e.code === "Space") {
      e.preventDefault();
    }

    if (e.code == "Enter" && tag !== "") {
      if (blogData.tags.length >= 10) {
        e.target.value = "";
        return toast.error("You can add upto maximum 10 tags");
      }

      if (blogData.tags.includes(tag)) {
        e.target.value = "";
        return toast.error("This tag is already added");
      }
      setBlogData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      e.target.value = "";
    }
  }
  useEffect(() => {
    if (!editorjsRef.current) {
      initializedEditorJS();
    }

    return () => {
      if (editorjsRef.current?.destroy) {
        editorjsRef.current.destroy();
      }
      editorjsRef.current = null;
      dispatch(setIsOpen(false));
      if (window.location.pathname != `/edit/${id}`) {
        dispatch(removeSelectedBlog());
      }
    };
  }, []);

  useEffect(() => {
    if (id) {
      setBlogData({
        title: initialTitle || "",
        description: initialDesc || "",
        image: initialImage || null,
        content: content,
        draft:draft,
        tags:tags

      });
    }
  }, [id, initialTitle, initialDesc, initialImage, content]);

  if (!token) return <Navigate to="/signin" />;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 max-sm:mt-4 ">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">
        {id ? "Edit Blog Post" : "Create New Blog Post"}
      </h1>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-10">
          <div className="w-full md:w-1/2">
            <label className="block text-gray-700 mb-2">Featured Image</label>
            <label htmlFor="image" className="cursor-pointer block">
              {blogData.image ? (
                <div className="relative group">
                  <img
                    src={
                      typeof blogData.image === "string"
                        ? blogData.image
                        : URL.createObjectURL(blogData.image)
                    }
                    alt="Blog preview"
                    className="w-full h-48 md:h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 md:h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm md:text-base">
                    Click to upload an image
                  </span>
                </div>
              )}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] &&
                setBlogData((prev) => ({ ...prev, image: e.target.files[0] }))
              }
            />
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your blog title"
                type="text"
                value={blogData.title}
                onChange={(e) =>
                  setBlogData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Tag</label>
              <input
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add tags"
                type="text"
                onKeyDown={handleKeyDown}
              />
              <div className="flex flex-col mb-1">
                <p className="text-xs  opacity-60 ">
                  * Click on Enter to add Tag
                </p>
                <p className="text-xs opacity-60">
                  {10 - blogData?.tags?.length} tags remaining
                </p>
              </div>
              <div className="flex flex-wrap">
                {blogData?.tags?.map((tag, index) => (
                  <div
                    className="bg-gray-200 m-0.5 gap-1 text-black rounded-full px-3 py-0.5 flex justify-center items-center hover:text-white hover:bg-blue-400"
                    key={index}
                  >
                    <p>{tag}</p>
                    <i
                      className="fi fi-sr-times-hexagon mt-1 text-xl cursor-pointer"
                      onClick={() => deleteTag(index)}
                    ></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your blog description here"
              value={blogData.description}
              onChange={(e) =>
                setBlogData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Draft</label>
            <select
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={blogData.draft}
              name=""
              id=""
              onChange={(e) =>
                setBlogData((prev) => ({
                  ...prev,
                  draft: e.target.value == "true" ? true : false,
                }))
              }
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          
        </div>

        <div
          id="editorjs"
          className="min-h-[200px] border rounded-lg p-3"
        ></div>

        <button
          onClick={id ? handleUpdateBlog : handlePostBlog}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-3 px-4 rounded-lg transition-colors"
        >
          {blogData.draft
            ? "Save as Draft"
            : id
            ? "Update Blog Post"
            : "Publish Blog Post"}
        </button>
      </div>
    </div>
  );
};

export default AddBlogPage;
