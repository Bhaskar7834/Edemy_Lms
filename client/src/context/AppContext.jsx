import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()
    const { getToken } = useAuth()
    const { user } = useUser()

    const [showLogin, setShowLogin] = useState(false)
    const [isEducator, setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])

    // Fetch All Courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/course/all');
            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
            toast.error(error.message)
        }
    }

    // 🟢 UPDATED: Fetch User Data with Auto-Sync for Localhost
    const fetchUserData = async () => {
        if (!user) return;

        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setUserData(data.user)
                if (user.publicMetadata.role === 'educator') {
                    setIsEducator(true)
                }
            } else if (data.message === "User Not Found") {
                // 🔥 AUTO-FIX: User exists in Clerk but not MongoDB. Create them now.
                const { data: createData } = await axios.post(backendUrl + '/api/user/force-create', {
                    userId: user.id,
                    email: user.primaryEmailAddress.emailAddress,
                    name: user.fullName,
                    imageUrl: user.imageUrl,
                });

                if (createData.success) {
                    // User created successfully, try fetching data again
                    fetchUserData();
                } else {
                    toast.error("Failed to create user: " + createData.message);
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Toast is removed here to prevent spamming errors on load
        }
    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Error fetching enrolled courses:", error)
            toast.error(error.message)
        }
    }

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map(
            (chapter) => chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            )
        )
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) {
            return 0
        }
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    useEffect(() => {
        fetchAllCourses()
    }, [])

    // Fetch User's Data if User is Logged In
    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserEnrolledCourses()
        } else {
            setUserData(null)
            setEnrolledCourses([])
        }
    }, [user])

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        isEducator, setIsEducator
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}