import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { handleFollowCreator, handleSaveBlogs } from "./BlogPage";
import { useSelector } from "react-redux";
import DisplayBlogs from "../components/DisplayBlogs";

function ProfilePage() {
  const { username } = useParams();
  const [userDate, setUserData] = useState(null);
  const { token, id: userId } = useSelector((state) => state.user);
  const location = useLocation();

  function renderComponent() {
    if (location.pathname === `/${username}`) {
      return (
        <DisplayBlogs blogs={userDate.blogs.filter((blog) => !blog.draft)} />
      );
    } else if (location.pathname === `/${username}/saved-blogs`) {
      return (
        <>
          {userDate.showSavedBlogs || userDate._id === userId ? (
            <DisplayBlogs blogs={userDate.saveBlogs} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/liked-blogs`) {
      return (
        <>
          {userDate.showLikedBlogs || userDate._id === userId ? (
            <DisplayBlogs blogs={userDate.likeBlogs} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else {
      return (
        <>
          {userDate._id === userId ? (
            <DisplayBlogs blogs={userDate.blogs.filter((blog) => blog.draft)} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    }
  }

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        let res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/${username.split("@")[1]}`
        );
        setUserData(res.data.user);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      }
    }
    fetchUserDetails();
  }, [username]);

  return (
    <div className="w-full flex justify-center px-4">
      {userDate ? (
        <div className="w-full max-w-[1280px] flex flex-col lg:flex-row-reverse justify-between gap-10 mt-4">
          <div className="w-full lg:w-[30%] flex-shrink-0">
            <div className="my-4">
              <div className="w-20 h-20">
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${userDate.name}`}
                  alt=""
                  className="rounded-full"
                />
              </div>
              <p className="text-base font-medium my-3">{userDate.name}</p>
              <p className="text-slate-600">
                {userDate.followers.length} Followers
              </p>
              <p className="text-slate-700 opacity-80 font-normal text-sm my-3">
                {userDate.bio}
              </p>
              {userId === userDate._id ? (
                <Link to={"/edit-profile"}>
                  <button className="bg-green-500 px-6 py-2 rounded-full text-white my-3 text-xl font-semibold w-full">
                    Edit Profile
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => handleFollowCreator(userDate._id, token)}
                  className="bg-green-500 px-6 py-2 rounded-full text-white my-3 text-xl font-semibold w-full"
                >
                  Follow
                </button>
              )}
              <div className="my-6 w-full">
                <h2 className="font-semibold">Following</h2>
                <div className="my-5 space-y-4">
                  {userDate.following.map((user) => (
                    <div key={user._id} className="flex justify-between items-center">
                      <Link to={`/@${user.username}`}>
                        <div className="flex gap-2 items-center hover:underline cursor-pointer">
                          <div className="w-5 h-5">
                            <img
                              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`}
                              alt=""
                              className="rounded-full"
                            />
                          </div>
                          <p className="text-base font-semibold">{user.name}</p>
                        </div>
                      </Link>
                      <i className="fi fi-bs-menu-dots cursor-pointer opacity-50"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[65%]">
            <div className="hidden sm:flex justify-between my-6 items-center">
              <p className="text-3xl sm:text-4xl font-semibold">
                {userDate.name}
              </p>
              <p>
                <i className="fi fi-bs-menu-dots cursor-pointer opacity-50"></i>
              </p>
            </div>
            <div className="my-6">
              <nav className="my-4 overflow-x-auto">
                <ul className="flex gap-5 text-sm whitespace-nowrap">
                  <li>
                    <Link
                      to={`/${username}`}
                      className={`${
                        location.pathname === `/${username}`
                          ? "border-b-2 border-black"
                          : ""
                      } pb-1`}
                    >
                      Home
                    </Link>
                  </li>
                  {userDate.showSavedBlogs || userDate._id === userId ? (
                    <li>
                      <Link
                        to={`/${username}/saved-blogs`}
                        className={`${
                          location.pathname === `/${username}/saved-blogs`
                            ? "border-b-2 border-black"
                            : ""
                        } pb-1`}
                      >
                        Saved <span className="hidden sm:inline">Blog</span>
                      </Link>
                    </li>
                  ) : null}
                  {userDate.showLikedBlogs || userDate._id === userId ? (
                    <li>
                      <Link
                        to={`/${username}/liked-blogs`}
                        className={`${
                          location.pathname === `/${username}/liked-blogs`
                            ? "border-b-2 border-black"
                            : ""
                        } pb-1`}
                      >
                        Liked <span className="hidden sm:inline">Blog</span>
                      </Link>
                    </li>
                  ) : null}
                  {userDate._id === userId ? (
                    <li>
                      <Link
                        to={`/${username}/draft-blogs`}
                        className={`${
                          location.pathname === `/${username}/draft-blogs`
                            ? "border-b-2 border-black"
                            : ""
                        } pb-1`}
                      >
                        Draft <span className="hidden sm:inline">Blog</span>
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </nav>
              {renderComponent()}
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-xl font-medium">Loading...</h1>
      )}
    </div>
  );
}

export default ProfilePage;
