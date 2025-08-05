const { verifyJWT } = require("../utilis/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "please sign in",
      });
    }

    try {
      let user = await verifyJWT(token);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "please sign in",
        });
      }
      req.user = user.id;
      next();
    } catch (error) {}
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Token Missing",
    });
  }
};

module.exports = verifyUser;
