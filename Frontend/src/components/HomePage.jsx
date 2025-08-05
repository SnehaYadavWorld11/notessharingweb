import axios from "axios";
import { useEffect, useState } from "react";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../hooks/usePagination";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [page, setPage] = useState(1);
  const { blogs, hasMore } = usePagination("blogs", {}, 2, page);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row p-2 sm:px-6 lg:px-8 mt-5 gap-4 max-sm:mt-8">
      <div className="w-full md:w-2/3">
        <DisplayBlogs blogs={blogs} />
        {hasMore && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-blue-500 px-6 py-2 rounded-full text-white my-3 text-xl font-semibold"
          >
            Load More
          </button>
        )}
      </div>

      <div className="hidden md:block w-full md:w-1/3 ">
        <div className="sticky top-[80px]">
          <h1 className="text-xl font-semibold mb-4">Recommended Topics</h1>
          <div className="flex flex-wrap">
            {["react", "expressjs", "mongodb", "nodejs"].map((tag, index) => (
              <Link to={`/tag/${tag}`} key={index}>
                <div className="bg-gray-200 m-1 text-black rounded-full px-5 py-1 flex justify-center items-center hover:text-white hover:bg-blue-400 cursor-pointer text-sm">
                  <p>{tag}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;