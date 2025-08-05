import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthForm from "./pages/AuthForm";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import AddBlogPage from "./pages/AddBlogPage";
import BlogPage from "./pages/BlogPage";
import VerifyUser from "./components/VerifyUser";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import SearchBlogs from "./components/SearchBlogs";
import Setting from "./components/Setting";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<AuthForm type="signin" />} />
          <Route path="signup" element={<AuthForm type="signup" />} />
          <Route path="addblog" element={<AddBlogPage />} />
          <Route path="blog/:id" element={<BlogPage />} />
          <Route path="blog/:id" element={<BlogPage />} />
          <Route path="edit/:id" element={<AddBlogPage />} />
          <Route path="search" element={<SearchBlogs />} />
          <Route path="tag/:tag" element={<SearchBlogs />} />
          <Route path="verify-email/:verificationToken" element={<VerifyUser />} />
          <Route path="/:username" element={<ProfilePage/>} />
          <Route path="/:username/saved-blogs" element={<ProfilePage/>} />
          <Route path="/:username/liked-blogs" element={<ProfilePage/>} />
          <Route path="/:username/draft-blogs" element={<ProfilePage/>} />
          <Route path="edit-profile" element={<EditProfile/>} />
          <Route path="/setting" element={<Setting/>}/>
          <Route path="*" element={<h1>Oops!! Page Not Found</h1>} />
        </Route>
      </Routes>
  );
}

export default App;
