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



const allowedOrigins = [
  "http://localhost:5173",
  "https://notessharingweb.vercel.app",
  FRONTEND_URL
].filter(Boolean);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
      if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
      return false;
    })) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true
}));



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
