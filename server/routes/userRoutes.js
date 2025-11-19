import express from 'express'
// 🟢 UPDATE: Added verifyPayment to the imports
import { 
    addUserRating, 
    getUserCourseProgress, 
    getUserData, 
    purchaseCourse, 
    updateUserCourseProgress, 
    userEnrolledCourses, 
    forceCreateUser, 
    verifyPayment 
} from '../controllers/userController.js';

const userRouter = express.Router()

// Get user Data
userRouter.get('/data', getUserData)
userRouter.post('/purchase', purchaseCourse)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/get-course-progress', getUserCourseProgress)
userRouter.post('/add-rating', addUserRating)

// Route to manually create user (fixes localhost issue)
userRouter.post('/force-create', forceCreateUser)

// 🟢 NEW ROUTE: This connects the frontend check to the backend verification
userRouter.post('/verify-payment', verifyPayment)

export default userRouter;