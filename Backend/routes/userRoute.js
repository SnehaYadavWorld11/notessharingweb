const express  = require("express");
const {createUser,retriveUser, retriveUserById, updateUserDetails, deleteUser, login, verifyEmail,googleAuth, followUser,changeSavedLikedBlog} = require("../controllers/userController");
const verifyUser = require("../middleware/auth");
const upload = require("../utilis/multer");

const route = express.Router();

route.post("/signup", createUser);

route.post("/signin", login);

route.get("/users", retriveUser);

route.get("/user/:username", retriveUserById);

route.patch("/user/:id",verifyUser,upload.single("profilePic"), updateUserDetails);

route.delete("/user/:id",verifyUser, deleteUser);


//verify email/token
route.get("/verify-email/:verificationToken", verifyEmail)

//googleauth
route.post("/google-auth", googleAuth)

//follow

route.patch("/follow/:id" , verifyUser, followUser)

route.patch("/change-saved-liked-blog-visibility" , verifyUser,changeSavedLikedBlog)




module.exports = route