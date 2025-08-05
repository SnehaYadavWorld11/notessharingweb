import { Link } from "react-router-dom";
import { formDate } from "../utils/formatDate";
import { useSelector } from "react-redux";

function DisplayBlogs({ blogs }) {
  const { token, id: userId } = useSelector((state) => state.user);
    
  return (
    <div>
      {
      blogs.length > 0 ?
      blogs.map((blog) => (
        <Link
          to={`/blog/${blog?.blogId}`}
          key={blog?._id}
          className="block border-b border-gray-200 pb-8 mb-8 last:border-0"
        >
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-gray-500 mb-1">{blog?.creator?.name}</p>
              <h2 className="font-bold text-xl mb-2 text-gray-800 max-sm:text-xl">
                {blog?.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {blog?.description}
              </p>

              <div className="flex gap-4 text-gray-500 text-sm">
                <p>{formDate(blog?.createdAt)}</p>
                <p className="flex items-center gap-1 cursor-pointer">
                  <i className="fi fi-ts-circle-heart"></i>
                  {blog?.likes?.length}
                </p>
                <p className="flex items-center gap-1 cursor-pointer">
                  <i className="fi fi-sr-comment-alt"></i>
                  {blog?.comments?.length}
                </p>
                <p
                  className="flex items-center gap-1 cursor-pointer "
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveBlogs(blog?._id, token);
                  }}
                >
                  {blog?.totalSaves?.includes(userId) ? (
                    <i className="fi fi-sr-bookmark"></i>
                  ) : (
                    <i className="fi fi-br-bookmark"></i>
                  )}
                </p>
              </div>
            </div>

            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={blog?.image}
                alt={blog?.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </Link>
      ))
    :<h1 className="text-3xl text-gray-800 opacity-50"><i>No data found</i></h1>}
    </div>
  );
}

export default DisplayBlogs;
