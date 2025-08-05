import { useState } from "react";

function Input({ type, placeholder, setUserData, field, value, icon }) {
    const [showPassword, setShowPassWord] = useState(true);
    return (
        <div className="relative w-full">
            <i className={"fi " + icon + " absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600"}></i>
            <input
                value={value}
                type={type !== "password" ? type : (showPassword ? "text" : type)}
                placeholder={placeholder}
                className="w-full h-10 sm:h-12 px-10 text-center sm:text-left text-gray-600 font-medium border border-gray-300 rounded-lg bg-amber-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) =>
                    setUserData((prev) => ({ ...prev, [field]: e.target.value }))
                }
            />
            {
                type == "password" && (
                    <i 
                        onClick={() => setShowPassWord((prev) => !prev)} 
                        className={`fi ${showPassword ? "fi-ss-eye" : "fi-ss-eye-crossed"} absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer`}
                    ></i>
                )
            }
        </div>
    );
}

export default Input;