import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function VerifyUser() {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    async function verityUser() {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/verify-email/${verificationToken}`
        );
        toast.success(res.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        navigate("/signin");
      }
    }
    verityUser();
  }, [verificationToken]);
  return <div>VerifyUser</div>;
}

export default VerifyUser;
