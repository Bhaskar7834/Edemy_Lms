# Edemy - Learning Management System

Edemy is a full-stack Learning Management System (LMS) designed to support modern online education. The platform enables students to browse, purchase, and view video courses while providing educators with tools to manage and publish course content. It features secure payments, role-based authentication, clean data modeling, and a fully responsive user interface.

---

## 📸 Project Screenshots

### 🏠 Home Page
<img src="https://github.com/user-attachments/assets/65a6f281-53e8-4fd7-a4cc-1a2a8bc5feca" width="100%" alt="Homepage" />

### 💳 Stripe Checkout
<img src="https://github.com/user-attachments/assets/7c3cd73a-2d75-4cf3-942e-dff615d6a988" width="100%" alt="Stripe Payments" />

### 🎥 Course Player
<img src="https://github.com/user-attachments/assets/92b7bda4-a470-4fcf-89d9-71740e43891c" width="100%" alt="Course Player" />

### 📚 Courses Page
<img src="https://github.com/user-attachments/assets/dca750ca-d67e-4575-a01d-d77a50274677" width="100%" alt="Courses Page" />

### 🧑‍🏫 Educator Dashboard
<img src="https://github.com/user-attachments/assets/c7c96dab-7b14-43aa-bbd5-f1869dbb5176" width="100%" alt="Educator Dashboard" />

---

## 🛠 Technologies Used

- **Frontend:** React.js, Tailwind CSS, Vite, Context API  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** Clerk (Role-Based Access Control)  
- **Payments:** Stripe (Secure Server-Side Verification)  
- **State Management:** React Context API  

---

## 🚀 Key Features

### 🔐 Secure Payment Integration  
- Integrated Stripe Checkout with backend session verification  
- Ensures enrollments are created only after successful payment completion  

### 👤 Authentication & RBAC  
- Clerk authentication with role-based access (Student, Educator)  
- Automatic user synchronization between Clerk and MongoDB to maintain consistent identity mapping  

### 🎬 Interactive Course Player  
- Custom video player with chapter navigation  
- Real-time progress tracking for lectures and overall course completion  

### 📊 Clean Data Architecture  
- Relational schema using Mongoose references and `populate()`  
- Connects users, purchased courses, and progress data efficiently  

---
## ⚙️ Installation and Setup

### 1️⃣ Clone the Repository
Use the following command to clone the project:
git clone https://github.com/Bhaskar7834/Edemy_Lms.git

### 2️⃣ Install Dependencies (Client + Server)
Run the following command to install all required dependencies:
npm run install-all

### 3️⃣ Configure Environment Variables
Create `.env` files inside both the `client` and `server` folders with the following values:

Client `.env`:
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SERVER_URL=https://your-backend-url.onrender.com

Server `.env`:
MONGO_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=https://your-frontend-url.vercel.app

### 4️⃣ Start Development Server
Use the following command to run both client and server:
npm run dev
