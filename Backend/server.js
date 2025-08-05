const express = require("express");
const app = express();
app.use(express.json());
let users = [];

app.post("/users", (req, res) => {
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

    users.push({ ...req.body, id: users.length + 1 });
    return res
      .status(200)
      .json({ success: true, message: "user detail added successfully" });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, message: "please try again" });
  }
});

app.get("/users", (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "user fetched successfullt", users });
  } catch (error) {
    return res
      .status(200)
      .json({ success: false, message: "error occured while user fetching" });
  }
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  let userId = users.filter((user) => user.id == id);
  if (userId.length==0) {
    return res.status(404).json({ success: false, message: "user not found" });
  }
  try {
    return res
      .status(200)
      .json({
        success: true,
        message: "user details fetched successfullt",
        userId,
      });
  } catch (error) {
    return res
      .status(200)
      .json({ success: false, message: "error occured while user fetching" });
  }
});

app.patch('/user/:id',(req,res)=>{
    const {id} = req.params;
    let updateUserDetail = users.findIndex(user=> user.id == id);
    users[updateUserDetail]=({...users[updateUserDetail],...req.body});
    return res.status(200).json({success:true,message :"user detail updated successfully"})
})


app.delete('/user/:id',(req,res)=>{
    const {id} = req.params;
    users = users.filter(user=>user.id!=id);
    return res.status(200).json({success:true,message:"user delete successfully"});
})

app.listen(3000, () => {
  console.log("server started in server js");
});
