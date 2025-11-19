import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import stripe from "stripe";

/* ======================================================
   GET LOGGED-IN USER DATA
====================================================== */
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User Not Found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   PURCHASE COURSE — CREATE STRIPE SESSION
====================================================== */
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.auth.userId;

        if (!courseId) {
            return res.json({ success: false, message: "courseId missing" });
        }

        const courseData = await Course.findById(courseId);
        const userData = await User.findById(userId);

        if (!courseData || !userData) {
            return res.json({ success: false, message: "Data Not Found" });
        }

        // Calculate final price
        const finalPrice =
            courseData.coursePrice -
            (courseData.discount * courseData.coursePrice) / 100;

        // Create purchase record
        const newPurchase = await Purchase.create({
            courseId: courseData._id,
            userId,
            amount: finalPrice.toFixed(2),
        });

        // Stripe Setup
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY.werCase();
        const origin = process.env.FRONTEND_URL; // 🔥 FIXED

        // Stripe line item
        const line_items = [
            {
                price_data: {
                    currency,
                    product_data: { name: courseData.courseTitle },
                    unit_amount: Math.round(finalPrice * 100), // 🔥 FIXED
                },
                quantity: 1,
            },
        ];

        // Create Stripe Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/course/${courseId}`,
            line_items,
            mode: "payment",
            metadata: {
                purchaseId: newPurchase._id.toString(),
            },
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   VERIFY PAYMENT — ENROLL USER
====================================================== */
export const verifyPayment = async (req, res) => {
    try {
        const { success_id } = req.body;

        if (!success_id) {
            return res.json({ success: false, message: "Missing session ID" });
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // Retrieve Stripe Session
        const session = await stripeInstance.checkout.sessions.retrieve(success_id);

        if (session.payment_status !== "paid") {
            return res.json({ success: false, message: "Payment failed or pending" });
        }

        const purchaseId = session.metadata.purchaseId;
        const purchaseData = await Purchase.findById(purchaseId);

        if (!purchaseData) {
            return res.json({ success: false, message: "Purchase record not found" });
        }

        const userData = await User.findById(purchaseData.userId);
        const courseId = purchaseData.courseId;

        if (!userData || !courseId) {
            return res.json({ success: false, message: "Enrollment failed" });
        }

        // Prevent duplicate enrollment
        const isAlreadyEnrolled = userData.enrolledCourses.some(
            (id) => id.toString() === courseId.toString()
        );

        if (!isAlreadyEnrolled) {
            // Enroll user
            userData.enrolledCourses.push(courseId);
            await userData.save();

            // Mark purchase completed
            purchaseData.status = "completed";
            await purchaseData.save();

            // Update course record
            const courseData = await Course.findById(courseId);
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
        }

        res.json({ success: true, message: "Payment Successful, User Enrolled!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   USER ENROLLED COURSES
====================================================== */
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate("enrolledCourses");

        res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   UPDATE COURSE PROGRESS
====================================================== */
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId, lectureId } = req.body;

        let progressData = await CourseProgress.findOne({ userId, courseId });

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: "Lecture Already Completed" });
            }
            progressData.lectureCompleted.push(lectureId);
            await progressData.save();
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId],
            });
        }

        res.json({ success: true, message: "Progress Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   GET USER COURSE PROGRESS
====================================================== */
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.body;

        const progressData = await CourseProgress.findOne({ userId, courseId });

        res.json({ success: true, progressData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   ADD USER RATING
====================================================== */
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: "Invalid Details" });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.json({ success: false, message: "Course not found." });

        const user = await User.findById(userId);
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: "User has not purchased this course." });
        }

        const existingIndex = course.courseRatings.findIndex(
            (r) => r.userId === userId
        );

        if (existingIndex > -1) {
            course.courseRatings[existingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        res.json({ success: true, message: "Rating added" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/* ======================================================
   FORCE CREATE USER (Clerk)
====================================================== */
export const forceCreateUser = async (req, res) => {
    try {
        const { userId, email, name, imageUrl } = req.body;

        const existingUser = await User.findById(userId);
        if (existingUser) {
            return res.json({ success: true, message: "User already exists", user: existingUser });
        }

        const user = await User.create({
            _id: userId,
            email,
            name,
            imageUrl,
            enrolledCourses: [],
        });

        res.json({ success: true, message: "User Force Created!", user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }

    
};





