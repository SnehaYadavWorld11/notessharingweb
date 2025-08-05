import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../utils/userSlice";
import Input from "../components/Input";
import googleIcon from "../assets/google-logo-search-new-svgrepo-com.svg";
import { googleAuth } from "../utils/firebase";

function AuthForm({ type }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleAuthForm(e) {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/${type}`,
        userData
      );
      if (type == "signup") {
        toast.success(res.data.message);
        navigate("/signin");
      } else {
        dispatch(login(res.data.user));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setUserData({
        name: "",
        email: "",
        password: "",
      });
    }
  }

  async function handleGoogleAuth() {
    try {
      let data = await googleAuth();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/google-auth`,
        {
          accessToken: data.accessToken,
        }
      );
      // console.log(res);
      // dispatch(login(res.data.user));
      // toast.success(res.data.message);
      // navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 mx-auto max-w-md lg:max-w-lg xl:max-w-xl py-8 sm:py-10 md:py-12 mt-10">
      <div className="bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 items-center text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            {type === "signin" ? "Sign In" : "Sign Up"}
          </h1>

          <form
            className="w-full flex flex-col gap-3 sm:gap-4"
            onSubmit={handleAuthForm}
          >
            {type === "signup" && (
              <Input
                type={"text"}
                placeholder={"Enter your full name"}
                setUserData={setUserData}
                field={"name"}
                value={userData.name}
                icon={"fi-ss-user"}
              />
            )}

            <Input
              type={"email"}
              placeholder={"Enter your email"}
              setUserData={setUserData}
              field={"email"}
              value={userData.email}
              icon={"fi-sr-envelope"}
            />

            <Input
              type={"password"}
              placeholder={"Enter your password"}
              setUserData={setUserData}
              field={"password"}
              value={userData.password}
              icon={"fi-ss-lock"}
            />

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 text-sm sm:text-base"
            >
              {type === "signin" ? "Login" : "Register"}
            </button>
          </form>

          <div className="relative w-full my-1 sm:my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-xs sm:text-sm text-gray-500">
                or
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
          >
            <img
              className="w-4 h-4 sm:w-5 sm:h-5"
              src={googleIcon}
              alt="Google"
            />
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          {type === "signin" ? (
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign Up
              </Link>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
