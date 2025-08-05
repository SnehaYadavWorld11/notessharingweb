const cors = require("cors");
const express = require("express");
const app = express();
const connectDb = require("./config/dbConnect");
const cloudinaryConfig = require("./utilis/cloudinaryConfig");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
require("dotenv").config(); 
const userRoute  = require("./routes/userRoute");
const blogRoute  = require("./routes/blogRoute");

const port = PORT  || 5000;



app.use(express.json());
app.use(cors({origin: FRONTEND_URL}));



app.get("/",(req,res)=>{
  res.send("index file")
})

app.use("/api/v1",userRoute);
app.use("/api/v1",blogRoute);

app.listen(port, () => {
  console.log("server started");
  connectDb();
  cloudinaryConfig();
});
