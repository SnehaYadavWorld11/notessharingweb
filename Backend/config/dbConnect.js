const mongoose = require("mongoose");
const { DB_URL } = require("./dotenv.config");
require("dotenv").config();
async function connectDb() {
  try {
    await mongoose.connect(
      DB_URL
    );
    console.log("database connect successfully");
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = connectDb