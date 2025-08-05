const express = require("express");
const {
  retriveAllBlog,
  retriveBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog,
  searchBlogs,
} = require("../controllers/blogController");
const {
  addComment,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
} = require("../controllers/commentController");

const verifyUser = require("../middleware/auth");
const upload = require("../utilis/multer");

const route = express.Router();

route.get("/blogs", retriveAllBlog);
route.get("/blogs/:id", retriveBlog);
route.post("/blogs", verifyUser, upload.fields([{name : "image" ,maxCount : 1} , {name : "images"}]), createBlog);
route.patch("/blogs/:id", verifyUser, upload.fields([{name : "image" ,maxCount : 1} , {name : "images"}]), updateBlog);
route.delete("/blogs/:id", verifyUser, deleteBlog);


route.post("/blogs/like/:id", verifyUser, likeBlog);


route.post("/blogs/comment/:id", verifyUser, addComment);
route.delete("/blogs/comment/:id", verifyUser, deleteComment);
route.patch("/blogs/edit-comment/:id", verifyUser, editComment);
route.patch("/blogs/like-comment/:id", verifyUser, likeComment);

route.post("/comment/:parentCommentId/:id", verifyUser, addNestedComment);

route.patch("/save-blog/:id",verifyUser , saveBlog)

route.get("/search-blogs", searchBlogs)


module.exports = route;
