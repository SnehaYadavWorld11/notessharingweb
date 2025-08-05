const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../utilis/generateToken");
const transporter = require("../utilis/transporter");

const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

const ShortUniqueId = require("short-unique-id");

const {
  deleteImageFromCloudinary,
  uploadImage,
} = require("../utilis/uploadImage");

const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL,
  FIREBASE_UNIVERSAL_DOMAIN,
  EMAIL_USER,
  FRONTEND_URL,
} = require("../config/dotenv.config");

const { randomUUID } = new ShortUniqueId({ length: 5 });

admin.initializeApp({
  credential: admin.credential.cert({
    type: FIREBASE_TYPE,
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY,
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: FIREBASE_AUTH_URI,
    token_uri: FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: FIREBASE_UNIVERSAL_DOMAIN,
  }),
});

async function createUser(req, res) {
  const { name, password, email } = req.body;
  try {
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill  the name " });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill  the password" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill  the email" });
    }

    const checkForExistingUser = await User.findOne({ email });

    if (checkForExistingUser) {
      if (checkForExistingUser.googleAuth) {
        return res.status(400).json({
          success: true,
          message:
            "This email is registered with Google. Please use Google singin",
        });
      }

      if (checkForExistingUser.isVerify) {
        return res.status(400).json({
          success: false,
          message: "Email already exists. Please use a different email",
        });
      } else {
        let verificationToken = await generateJWT({
          email: checkForExistingUser.email,
          id: checkForExistingUser._id,
        });
      }

      // if (checkForExistingUser) {
      //   if (checkForExistingUser.isVerify) {
      //     if (checkForExistingUser.googleAuth) {
      //       return res.status(400).json({
      //         success: true,
      //         message:
      //           "This email already registered  google.  Please try through continue with google",
      //       });
      //     }
      //     return res.status(400).json({
      //       success: false,
      //       message: "this email is already exist please try with new email id ",
      //     });
      //   } else {
      //     let verificationToken = await generateJWT({
      //       email: checkForExistingUser.email,
      //       id: checkForExistingUser._id,
      //     });

      const sendingEmail = transporter.sendMail({
        from: EMAIL_USER,
        to: checkForExistingUser.email,
        subject: "Email Verification",
        text: "Please Verify Your Email",
        html: `<h1>Click on the link to verify your email</h1>
            <a href="${FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>`,
      });

      return res.status(200).json({
        success: false,
        message: "Please Check Your Email For Varification",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0] + randomUUID();
    let newUser = await User.create({
      name,
      email,
      password: hashPassword,
      username,
    });
    let verificationToken = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    const sendingEmail = transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Email Verification",
      text: "Please Verify Your Email",
      html: `<h1>Click on the link to verify your email</h1>
            <a href="${FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>`,
    });

    return res.status(200).json({
      success: true,
      message: "Please Check Your Email For Varification",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Please Try Again",error: error.message });

  }
}

async function verifyEmail(req, res) {
  try {
    const { verificationToken } = req.params;
    const verifyToken = await verifyJWT(verificationToken);

    if (!verifyToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token/Email expired",
      });
    }
    const { id } = verifyToken;
    const user = await User.findByIdAndUpdate(
      id,
      { isVerify: true },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Please Try again",
      error: error.message,
    });
  }
}

async function googleAuth(req, res) {
  try {
    const { accessToken } = req.body;
    const response = await getAuth().verifyIdToken(accessToken);
    const { name, email } = response;
    let user = await User.findOne({ email });

    if (user) {
      if (user.googleAuth) {
        let token = await generateJWT({
          email: user.email,
          id: user._id,
        });
        return res.status(200).json({
          success: true,
          message: "logged in successfully",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            username: user.username,
            showLikedBlogs: user.showLikedBlogs,
            showSavedBlogs: user.showSavedBlogs,
            bio: user.bio,
            token,
          },
        });
      } else {
        return res.status(400).json({
          success: true,
          message:
            "This email already registered without google.  Please try through login form",
        });
      }
    }
    const username = email.split("@")[0] + randomUUID();
    let newUser = await User.create({
      name,
      email,
      googleAuth: true,
      isVerify: true,
      username,
    });
    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Registration is successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        username: newUser.username,
        showLikedBlogs: newUser.showLikedBlogs,
        showSavedBlogs: newUser.showSavedBlogs,
        bio: newUser.bio,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Please try again",
      error: error.message,
    });
  }
}

async function login(req, res) {
  const { password, email } = req.body;
  try {
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill  the password" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill  the email" });
    }

    let checkForExistingUser = await User.findOne({ email }).select(
      "password isVerify name email profilePic username bio showLikedBlogs showSavedBlogs"
    );
    if (!checkForExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User not exist",
      });
    }

    if (checkForExistingUser.googleAuth) {
      return res.status(400).json({
        success: true,
        message:
          "This email already registered  google.  Please use Google signin ",
      });
    }

    let checkForPass = await bcrypt.compare(
      password,
      checkForExistingUser.password
    );
    if (!checkForPass) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password" });
    }

    if (!checkForExistingUser.isVerify) {
      let verificationToken = await generateJWT({
        email: checkForExistingUser.email,
        id: checkForExistingUser._id,
      });

      const sendingEmail = transporter.sendMail({
        from: EMAIL_USER,
        to: checkForExistingUser.email,
        subject: "Email Verification",
        text: "Please Verify Your Email",
        html: `<h1>Click on the link to verify your email</h1>
            <a href="${FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>`,
      });
      return res.status(404).json({
        success: false,
        message: "Please Verify Your EMAIL",
      });
    }

    let token = await generateJWT({
      email: checkForExistingUser.email,
      id: checkForExistingUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "logged in successfully",
      user: {
        id: checkForExistingUser._id,
        name: checkForExistingUser.name,
        email: checkForExistingUser.email,
        profilePic: checkForExistingUser.profilePic,
        username: checkForExistingUser.username,
        bio: checkForExistingUser.bio,
        showLikedBlogs: checkForExistingUser.showLikedBlogs,
        showSavedBlogs: checkForExistingUser.showSavedBlogs,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Please try again", error : error.message });
  }
}

async function retriveUser(req, res) {
  try {
    const alluser = await User.find({});
    return res
      .status(200)
      .json({ success: true, message: "user fetched successfullt", alluser });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "error occured while user fetching",
      error: error.message,
    });
  }
}

async function retriveUserById(req, res) {
  // const { id } = req.params;
  const username = req.params.username;
  let user = await User.findOne({ username })
    .populate("blogs  following likeBlogs saveBlogs")
    .populate({
      path: "followers following",
      select: "name username",
    })
    .select("-password -email -_v -isVerify -googleAuth");

  if (!user) {
    return res.status(404).json({ success: false, message: "user not found" });
  }
  try {
    return res.status(200).json({
      success: true,
      message: "user details fetched successfullt",
      user,
    });
  } catch (error) {
    return res
      .status(200)
      .json({ success: false, message: "error occured while user fetching" });
  }
}

async function updateUserDetails(req, res) {
  try {
    const id = req?.params?.id;
    const { name, username, bio } = req.body;

    const image = req.file;

    const user = await User.findById(id);

    if (!req.body.profilePic) {
      if (user.profilePicId) {
        await deleteImageFromCloudinary(user.profilePicId);
      }

      user.profilePic = null;
      user.profilePicId = null;
    }

    if (image) {
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${image.buffer.toString("base64")}`
      );

      user.profilePic = secure_url;
      user.profilePicId = public_id;
    }

    if (user.username != username) {
      const findUser = await User.findOne({ username });

      if (findUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    user.username = username;
    user.name = name;
    user.bio = bio;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "user detail updated successfully",
      user: {
        name: user.name,
        profilePic: user.profilePic,
        username: user.username,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Please Try Again",
    });
  }
}

async function deleteUser(req, res) {
  // const { id } = req.params;
  const id = req.params.id;
  const deleteUser = await User.findByIdAndDelete(id);

  if (!deleteUser) {
    return res.status(404).json({ success: false, message: "user not found" });
  }

  return res
    .status(200)
    .json({ success: true, message: "user delete successfully", deleteUser });
}

async function followUser(req, res) {
  try {
    const followerId = req.user;
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(500).json({
        message: "User is not found",
      });
    }

    if (!user.followers.includes(followerId)) {
      await User.findByIdAndUpdate(id, {
        $addToSet: { followers: followerId },
      });
      await User.findByIdAndUpdate(followerId, {
        $addToSet: { following: id },
      });
      return res.status(200).json({
        success: true,
        message: "Followed Successfully",
        follow: true,
      });
    } else {
      await User.findByIdAndUpdate(id, { $pull: { followers: followerId } });
      await User.findByIdAndUpdate(followerId, { $pull: { following: id } });
      return res.status(200).json({
        success: true,
        message: " Unfollowed Successfully",
        follow: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function changeSavedLikedBlog(req, res) {
  try {
    const userId = req.user;
    const { showLikedBlogs, showSavedBlogs } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({
        message: "User is not found",
      });
    }

    await User.findByIdAndUpdate(userId, { showSavedBlogs, showLikedBlogs });
    return res.status(200).json({
      success: true,
      message: "Visibility Updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  createUser,
  retriveUser,
  retriveUserById,
  updateUserDetails,
  deleteUser,
  login,
  verifyEmail,
  googleAuth,
  followUser,
  changeSavedLikedBlog,
};
