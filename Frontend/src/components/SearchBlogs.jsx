import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../hooks/usePagination";

function SearchBlogs() {
  const [searchParams] = useSearchParams();
  const { tag } = useParams();
  const [page, setPage] = useState(1);
  const q = searchParams.get("q");

  const query = tag ? { tag: tag.toLowerCase().replace(" ", "-") } : { search: q };
  const { blogs, hasMore } = usePagination(
    "search-blogs",
    query,
    1,
    page
  );

  return (
    <div className="w-full md:w-[90%] lg:w-[70%] xl:w-[60%] h-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl my-6 sm:my-10 font-bold text-gray-500  sm:text-left">
        Results for <span className="text-black break-words">{tag ? tag : q}</span>
      </h1>
      <DisplayBlogs blogs={blogs} />
      {hasMore && (
        <div className="text-center mt-4 sm:mt-6">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-blue-500 hover:bg-blue-600 px-4 sm:px-6 py-2 rounded-full text-white text-lg sm:text-xl font-semibold transition-colors duration-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBlogs;