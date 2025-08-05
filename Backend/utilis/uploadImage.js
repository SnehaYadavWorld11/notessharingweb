const cloudinary = require("cloudinary").v2;

async function uploadImage(imagepath) {
  try {
    const result = await cloudinary.uploader.upload(imagepath, {
      folder: "blog app",
    });
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function deleteImageFromCloudinary(public_id) {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { uploadImage, deleteImageFromCloudinary };
