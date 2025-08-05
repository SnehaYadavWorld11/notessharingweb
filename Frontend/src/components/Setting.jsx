import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { updateData } from "../utils/userSlice";

function Setting() {
  const { token, showLikedBlogs, showSavedBlogs } = useSelector(
    (state) => state.user
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState({
    showLikedBlogs,
    showSavedBlogs,
  });

  async function handleVisibility() {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/change-saved-liked-blog-visibility`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateData(data));
      toast.success(res.data.message);
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  if (!token) return <Navigate to="/signin" />;

  return (
    <div className="max-w-md w-full mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl flex items-center gap-2 mb-8">
        Setting <i className="fi fi-ts-customize text-xl mt-1"></i>
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Show Saved Blogs?</label>
        <div className="relative">
          <button
            className="w-full text-left p-2 sm:p-3 border border-gray-300 rounded-lg bg-white focus:outline-none"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                showSavedBlogs: !prev.showSavedBlogs,
              }))
            }
          >
            {data.showSavedBlogs ? "True" : "False"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Show Liked Blogs?</label>
        <div className="relative">
          <button
            className="w-full text-left p-2 sm:p-3 border border-gray-300 rounded-lg bg-white focus:outline-none"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                showLikedBlogs: !prev.showLikedBlogs,
              }))
            }
          >
            {data.showLikedBlogs ? "True" : "False"}
          </button>
        </div>
      </div>

      <button
        onClick={handleVisibility}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 rounded-lg transition-colors"
      >
        Update
      </button>
    </div>
  );
}

export default Setting;
