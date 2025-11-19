import { useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get backend URL and the function to refresh enrollments
  const { backendUrl, fetchUserEnrolledCourses } = useContext(AppContext);

  // Check if Stripe returned a Session ID
  const successId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Call the verification endpoint we just created
        const { data } = await axios.post(backendUrl + '/api/user/verify-payment', { success_id: successId });

        if (data.success) {
          toast.success("Payment Successful! Course Enrolled.");
          
          // CRITICAL: Refresh the user's enrolled courses so the new course shows up immediately
          await fetchUserEnrolledCourses();
          
          // Navigate to the destination (e.g., /my-enrollments)
          navigate(`/${path}`);
        } else {
          toast.error("Payment Verification Failed.");
          navigate('/');
        }
      } catch (error) {
        console.error("Verification Error:", error);
        toast.error("Something went wrong confirming your payment.");
        navigate('/');
      }
    };

    if (successId) {
      // If there is a payment ID, verify it immediately
      verifyPayment();
    } else if (path) {
      // If no payment ID, just wait 5 seconds (Original Behavior)
      const timer = setTimeout(() => {
        navigate(`/${path}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [path, successId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;