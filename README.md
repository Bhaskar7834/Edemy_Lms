# Edemy - Learning Management System

Edemy is a comprehensive full-stack web application designed to facilitate online education. The platform allows students to browse, purchase, and view video courses while providing a seamless enrollment experience. It handles real-time payments, user authentication, and complex data relationships.

## Project Screenshots

![Home Page](screenshots/homepage.png)
*The landing page displaying available courses and search functionality.*

![Course Player](screenshots/course-player.png)
*The interactive video player with chapter navigation and progress tracking.*

## Technologies Used

- **Frontend:** React.js, Tailwind CSS, Vite, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** Clerk (Role-Based Access Control)
- **Payments:** Stripe (Custom Server-Side Verification)
- **State Management:** React Context API

## Key Features

1. **Secure Payment Integration**
   Integrated Stripe Checkout with a custom backend verification system. This ensures that user enrollments are only processed after a successful transaction is confirmed server-side, preventing unauthorized access.

2. **Robust Authentication**
   Implemented Clerk for secure user management. Developed a custom synchronization mechanism to ensure external user identities are consistently replicated in the internal MongoDB database.

3. **Responsive Course Player**
   Built a custom video interface that tracks user progress through chapters and lectures, calculating overall course completion rates in real-time.

4. **Data Integrity**
   Designed a relational schema within MongoDB using Mongoose references to efficiently link users, courses, and purchase history without data duplication.

## Installation and Setup

1. Clone the repository.
2. Install dependencies for both client and server:
   `npm run install-all`
3. Set up environment variables in `.env` files for both client and server.
4. Run the development server:
   `npm run dev`

## Deployment

- **Frontend:** Deployed on Vercel
- **Backend:** Deployed on Render
- **Database:** MongoDB Atlas
