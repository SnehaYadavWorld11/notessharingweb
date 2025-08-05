import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../utils/userSlice";

const Navbar = () => {
  const { token, name, profilePic, username } = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
        navigate("/");
    dispatch(logout());
    setShowPopup(false);

  }

  function handleSearch() {
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setShowMobileSearch(false);
    }
  }

  useEffect(() => {
    if (window.location.pathname !== "/search") {
      setSearchQuery("");
    }
  }, [window.location.pathname]);

  return (
    <>
      <div className="bg-blue-400 w-full h-[70px] px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white border-b shadow-md fixed top-0 left-0 z-40 ">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <div className="flex flex-col items-center">
            <Link to={"/"}>
              <i className="fi fi-sr-blog-pencil text-xl sm:text-2xl"></i>
              <p className="text-xs sm:text-sm">BLOG</p>
            </Link>
          </div>
          <div className="relative hidden sm:flex items-center">
            <i className="fi fi-rs-search text-gray-500 absolute left-2 top-1.5"></i>
            <input
              type="search"
              className="bg-white/70 rounded-2xl pl-7 p-1 text-sm border-none text-black focus:outline-none w-28 sm:w-40 md:w-56"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.code === "Enter") handleSearch();
              }}
            />
          </div>
        </div>

        <div className="flex items-center text-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="bg-white/70 rounded-full px-3 py-2 text-sm text-gray-700 flex items-center text-center sm:hidden"
          >
            <i className="fi fi-rs-search"></i>
          </button>

          <Link to={"/addblog"}>
            <div className="bg-white/70 rounded-full px-3 py-2 text-sm flex items-center">
              <i className="fi fi-tr-pen-field text-black"></i>
              <span className="hidden sm:inline-block ml-1 text-black">Write</span>
            </div>
          </Link>

          {token ? (
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
              onClick={() => setShowPopup((prev) => !prev)}
            >
              <img
                src={
                  profilePic
                    ? profilePic
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`
                }
                alt=""
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          ) : (
            <>
              <Link to={"/signin"}>
                <p className="bg-white/70 rounded-2xl px-3 py-1.5 text-sm sm:text-base text-black">Sign In</p>
              </Link>
              <Link to={"/signup"}>
                <p className="bg-white/70 rounded-2xl px-3 py-1.5 text-sm sm:text-base text-black">Sign Up</p>
              </Link>
            </>
          )}
        </div>

        {showMobileSearch && (
          <div className="absolute top-[65px] left-0 right-0 px-4 py-1  sm:hidden text-center">
            <div className="relative">
              <i className="fi fi-rs-search text-gray-500 absolute left-2 top-1.5"></i>
              <input
                type="search"
                className="bg-blue-200/40 w-full rounded-2xl pl-7 p-2 text-black text-sm focus:outline-none"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.code === "Enter") handleSearch();
                }}
                autoFocus
              />
            </div>
          </div>
        )}

        {showPopup && (
          <div
            onMouseLeave={() => setShowPopup(false)}
            className="w-[150px] bg-white absolute right-2 top-[70px] rounded-xl shadow-md z-40"
          >
            <Link to={`/@${username}`}>
              <p className="text-gray-700 py-2 px-3 hover:bg-blue-300 hover:text-black rounded-t-xl cursor-pointer">
                Profile
              </p>
            </Link>
            <Link to={"/edit-profile"}>
              <p className="text-gray-700 py-2 px-3 hover:bg-blue-300 hover:text-black cursor-pointer">
                Edit Profile
              </p>
            </Link>
            <Link to={"/setting"}>
              <p className="text-gray-700 py-2 px-3 hover:bg-blue-300 hover:text-black cursor-pointer">
                Setting
              </p>
            </Link>
            <p
              onClick={handleLogout}
              className="text-gray-700 py-2 px-3 hover:bg-blue-300 hover:text-black rounded-b-xl cursor-pointer"
            >
              Logout
            </p>
            
          </div>
        )}
      </div>

      <div className="pt-[80px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;