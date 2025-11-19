import Course from "../models/Course.js";

// -------------------------------
// Get All Published Courses
// -------------------------------
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .select(["-courseContent", "-enrolledStudents"])
            .populate({ path: "educator", select: "-password" });

        return res.json({ success: true, courses });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// -------------------------------
// Get Course by ID
// -------------------------------
export const getCourseId = async (req, res) => {
    const { id } = req.params;

    try {
        const courseData = await Course.findById(id)
            .populate({ path: "educator" });

        // ❗ Course not found → avoid crash
        if (!courseData) {
            return res.json({ success: false, message: "Course not found" });
        }

        // Safety check: Avoid undefined errors
        if (Array.isArray(courseData.courseContent)) {
            courseData.courseContent.forEach(chapter => {
                if (Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach(lecture => {
                        if (!lecture.isPreviewFree) {
                            lecture.lectureUrl = ""; // Hide URL
                        }
                    });
                }
            });
        }

        return res.json({ success: true, courseData });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
