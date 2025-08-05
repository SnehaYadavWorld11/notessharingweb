import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../utils/userSlice";
import { Navigate } from "react-router-dom";

function EditProfile() {
  const {
    token,
    id: userId,
    email,
    name,
    username,
    profilePic,
    bio,
  } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [userData, setUserData] = useState({
    profilePic,
    username,
    name,
    bio,
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [initialData, setInitialData] = useState({
    profilePic,
    username,
    name,
    bio,
  });

  function handleChange(e) {
    const { value, name, files } = e.target;
    if (files) {
      setUserData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setUserData((prevData) => ({ ...prevData, [name]: value }));
    }
  }

  async function handleUpdateProfile() {
    setButtonDisabled(true);

    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("username", userData.username);
    if (userData.profilePic) {
      formData.append("profilePic", userData.profilePic);
    }
    formData.append("bio", userData.bio);

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/user/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
      dispatch(login({...res.data.user,token,email,id:userId }))
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  }

  useEffect(() => {
    if (initialData) {
      const isEqual = JSON.stringify(userData) === JSON.stringify(initialData);
      setButtonDisabled(isEqual);
    }
  }, [userData, initialData]);
  if (!token) return <Navigate to="/signin" />;
  return (
    <div className="w-full">
      <div className="w-full md:w-[80%] lg:w-[60%] xl:w-[40%] mx-auto px-4 sm:px-6 md:px-10">
        <h1 className="text-center text-2xl sm:text-3xl font-medium my-6 sm:my-10">Edit Profile</h1>
        <div>
          <div className="my-4">
            <h1 className="text-lg sm:text-xl font-semibold my-2 text-gray-600">
              Profile Photo
            </h1>

            <div className="flex items-center flex-col gap-3">
              <label htmlFor="image" className="cursor-pointer">
                {userData?.profilePic ? (
                  <div className="relative group w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-300">
                      <img
                        src={
                          typeof userData?.profilePic === "string"
                            ? userData?.profilePic
                            : URL.createObjectURL(userData?.profilePic)
                        }
                        alt="Profile PhotoPrev"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm sm:text-base font-medium">
                        Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-1 sm:mb-2"
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
                    <span className="text-xs sm:text-sm">Select Image</span>
                  </div>
                )}
              </label>

              <h2
                className="text-base sm:text-lg text-red-600 hover:font-bold cursor-pointer"
                onClick={() => {
                  setUserData((prevData) => ({ ...prevData, profilePic: null }));
                }}
              >
                Remove
              </h2>
            </div>
            <input
              name="profilePic"
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </div>

          <div className="my-4">
            <label className="block text-gray-700 text-sm sm:text-base mb-1 sm:mb-2">Name</label>
            <input
              name="name"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your Name"
              type="text"
              defaultValue={userData.name}
              onChange={handleChange}
            />
          </div>

          <div className="my-4">
            <label className="block text-gray-700 text-sm sm:text-base mb-1 sm:mb-2">Username</label>
            <textarea
              name="username"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg h-24 sm:h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Your Username"
              defaultValue={userData.username}
              onChange={handleChange}
            />
          </div>

          <div className="my-4">
            <label className="block text-gray-700 text-sm sm:text-base mb-1 sm:mb-2">Bio</label>
            <textarea
              name="bio"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg h-24 sm:h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Your Bio"
              defaultValue={userData.bio}
              onChange={handleChange}
            />
          </div>

          <button
            disabled={buttonDisabled}
            className={`px-4 py-1 sm:px-6 sm:py-2 rounded-full text-white my-2 sm:my-3 text-lg sm:text-xl font-semibold ${
              buttonDisabled ? " bg-green-200" : "bg-green-500"
            }`}
            onClick={handleUpdateProfile}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;