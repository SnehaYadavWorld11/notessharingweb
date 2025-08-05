import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function usePagination(path, queryParams = {}, limit = 1, page = 1) {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchSearchBlog() {
      try {
        let res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/${path}`,
          {
            params: { ...queryParams, limit, page },
          }
        );
        setBlogs((prev) => [...prev, ...res.data.blogs]);
        setHasMore(res.data.hashMore);
      } catch (error) {
        navigate(-1);
        setBlogs([]);
        setHasMore(false);
        toast.error(error.response.data.message);
      }
    }
    fetchSearchBlog();
  }, [page]);

  return { blogs, hasMore };
}

export default usePagination;
