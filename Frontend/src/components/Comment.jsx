import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { useState } from "react";
import axios from "axios";
import {
  deleteCommentAndReply,
  setCommentLikes,
  setComments,
  setReplies,
  setUpdatedComments,
} from "../utils/selectedBlogSlice";
import { formDate } from "../utils/formatDate";
import toast from "react-hot-toast";

function Comment() {
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentEditComment, setCurrentEditComment] = useState(null);
  const {
    _id: blogId,
    comments,
    creator: { _id: creatorId },
  } = useSelector((state) => state.selectedBlog);
  const { token, id: userId } = useSelector((state) => state.user);

  async function handleComment() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
        {
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);

      dispatch(setComments(res.data.newComment));
      setComment("");
    } catch (error) {
      toast.error(error.response.data.message);

      console.log(error);
    }
  }

  return (
    <div className="bg-white h-screen fixed top-0 right-0 w-[400px] border-gray-400 drop-shadow-2xl p-5 overflow-y-scroll">
      <div className="flex justify-between">
        <h1 className="text-xl font-medium">Comment ({comments.length})</h1>
        <i
          onClick={() => dispatch(setIsOpen(false))}
          className="fi fi-tr-delete text-xl cursor-pointer"
        ></i>
      </div>

      <div className="my-4">
        <textarea
          type="text"
          placeholder="Comment..."
          className="border border-gray-200 drop-shadow-neutral-200  w-full p-3 text-lg focus:outline-none text-gray-600 resize-none"
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={handleComment}
          className="cursor-pointer h-10 text-center font-bold bg-blue-600 text-white mt-5 w-full"
        >
          ADD
        </button>
      </div>

      <div>
        <DisplayComments
          comments={comments}
          userId={userId}
          blogId={blogId}
          token={token}
          activeReply={activeReply}
          setActiveReply={setActiveReply}
          currentPopup={currentPopup}
          setCurrentPopup={setCurrentPopup}
          currentEditComment={currentEditComment}
          setCurrentEditComment={setCurrentEditComment}
          creatorId={creatorId}
        />
      </div>
    </div>
  );
}

function DisplayComments({
  comments = [],
  userId,
  blogId,
  token,
  activeReply,
  setActiveReply,
  currentPopup,
  setCurrentPopup,
  currentEditComment,
  setCurrentEditComment,
  creatorId,
}) {
  const [reply, setReply] = useState("");
  const [updatedCommentContent, setupdatedCommentContent] = useState("");
  const dispatch = useDispatch();

  async function handleReply(parentCommentId) {
    try {
      let res = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/comment/${parentCommentId}/${blogId}`,
        {
          reply,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReply("");
      setActiveReply(null);
      dispatch(setReplies(res.data.newReply));
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCommentLike(commentId) {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      console.log(error);
    }
  }

  function handleActiveReply(id) {
    setActiveReply((prev) => (prev === id ? null : id));
  }

  async function handleCommentDelete(id) {
    try {
      let res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      dispatch(deleteCommentAndReply(id));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setupdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  async function handleCommentUpdate(id) {
    try {
      let res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${id}`,
        {
          updatedCommentContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setupdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  return (
    <>
      {comments &&
        comments.map((c) => (
          <>
            <hr className="text-gray-200 drop-shadow-2xl" />
            <div className="flex flex-col gap-2 my-5">
              {currentEditComment === c._id ? (
                <div className="my-4">
                  <textarea
                    defaultValue={c.comment}
                    type="text"
                    placeholder="Reply..."
                    className="border border-gray-200 drop-shadow-neutral-200  w-full p-3 text-lg focus:outline-none text-gray-600 resize-none "
                    onChange={(e) => setupdatedCommentContent(e.target.value)}
                  />
                  <div className="flex gap-5">
                    <button
                      onClick={() => setCurrentEditComment(null)}
                      className="cursor-pointer h-10 text-center font-bold bg-red-600 text-white mt-5 w-full"
                    >
                      Cancle
                    </button>

                    <button
                      onClick={() => {
                        handleCommentUpdate(c._id);
                      }}
                      className="cursor-pointer h-10 text-center font-bold bg-blue-600 text-white mt-5 w-full"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex w-full justify-between ">
                    <div className="flex gap-3 justify-center items-center">
                      <div className="w-10 h-10 ">
                        <img
                          src={`https://api.dicebear.com/9.x/initials/svg?seed=${c.user?.name}`}
                          alt=""
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="capitalize font-medium">{c.user?.name}</p>
                        <p className="font-medium text-lg">
                          {formDate(c.createdAt)}
                        </p>
                      </div>
                    </div>
                    {c?.user?._id === userId || userId === creatorId ? (
                      currentPopup == c?._id ? (
                        <div className="bg-gray-200 w-[70px] rounded-lg">
                          <i
                            onClick={() =>
                              setCurrentPopup((prev) =>
                                prev == c?._id ? null : c?._id
                              )
                            }
                            className="fi fi-br-cross relative left-12 text-sm mt-1 cursor-pointer"
                          ></i>
                          {c.user._id === userId ? (
                            <p
                              className="p-2 py-1 hover:bg-blue-300"
                              onClick={() => {
                                setCurrentEditComment(c._id);
                                setCurrentPopup(null);
                              }}
                            >
                              Edit
                            </p>
                          ) : (
                            ""
                          )}

                          <p
                            className="p-2 py-1 hover:bg-blue-300"
                            onClick={() => {
                              handleCommentDelete(c._id);
                              setCurrentPopup(null);
                            }}
                          >
                            Delete
                          </p>
                        </div>
                      ) : (
                        <i
                          className="fi fi-bs-menu-dots cursor-pointer"
                          onClick={() => setCurrentPopup(c._id)}
                        ></i>
                      )
                    ) : (
                      ""
                    )}
                  </div>
                  <p>{c.comment}</p>

                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="flex gap-2 items-center">
                        {c.likes.includes(userId) ? (
                          <i
                            className="fi fi-sr-circle-heart text-red-500  cursor-pointer mt-1"
                            onClick={() => handleCommentLike(c._id)}
                          ></i>
                        ) : (
                          <i
                            className="fi fi-ts-circle-heart text-black  cursor-pointer mt-1"
                            onClick={() => handleCommentLike(c._id)}
                          ></i>
                        )}
                        <p className=" text-gray-500">{c.likes.length}</p>
                      </div>
                      <div className="flex gap-0.5 cursor-pointer">
                        <i className="fi fi-sr-comment-alt text-gray-600 mt-1"></i>
                        <p>{c.replies.length}</p>
                      </div>
                    </div>
                    <p
                      onClick={() => handleActiveReply(c._id)}
                      className="text-lg hover:underline cursor-pointer"
                    >
                      reply
                    </p>
                  </div>
                </>
              )}

              {activeReply === c._id && (
                <div className="my-4">
                  <textarea
                    type="text"
                    placeholder="Reply..."
                    className="border border-gray-200 drop-shadow-neutral-200  w-full p-3 text-lg focus:outline-none text-gray-600 resize-none"
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button
                    onClick={() => handleReply(c._id)}
                    className="cursor-pointer h-10 text-center font-bold bg-blue-600 text-white mt-5 w-full"
                  >
                    ADD
                  </button>
                </div>
              )}

              {c.replies.length > 0 && (
                <div className="pl-6 border-l-gray-300">
                  {" "}
                  <DisplayComments
                    comments={c.replies}
                    userId={userId}
                    blogId={blogId}
                    token={token}
                    activeReply={activeReply}
                    setActiveReply={setActiveReply}
                    currentPopup={currentPopup}
                    setCurrentPopup={setCurrentPopup}
                    currentEditComment={currentEditComment}
                    setCurrentEditComment={setCurrentEditComment}
                    creatorId={creatorId}
                  />
                </div>
              )}
            </div>
          </>
        ))}
    </>
  );
}

export default Comment;
