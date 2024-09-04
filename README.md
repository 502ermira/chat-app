# Er-Net: Chat App

**Er-Net** is a real-time chat application built with **React** and **Node.js**. It offers a user-friendly interface with features such as messaging, image sharing, friend requests, notifications, and more. Designed for seamless communication, Er-Net allows users to connect with friends in real time.

**Live Demo**: [Click here](https://er-net.vercel.app/) *(Note: The demo may be slow due to free hosting limitations.)*

## Features

- **User Authentication**: 
  - Login and signup forms
  - Forgot password feature (uses SendGrid for password reset emails)
  
- **Friend Management**: 
  - Send and receive friend requests by username
  - Add and remove friends
  
- **Real-Time Chat**: 
  - Send and receive text messages and images
  - Typing indicators
  - Real-time notifications for friend requests and messages
  
- **Message Status**: 
  - View if a friend has seen your message

## Technologies Used

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-Time Communication**: Socket.io
- **Image Processing**: Sharp
- **Email Service**: SendGrid

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/502ermira/chat-app.git
   cd chat-app/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory and add your environment variables:
   ```env
    MONGO_URI=your_mongo_uri # MongoDB connection string
    JWT_SECRET=your_jwt_secret # Secret key for JWT signing
    SENDGRID_API_KEY=your_sendgrid_api_key # API key for SendGrid email service
    SENDGRID_FROM_EMAIL=your_email # Email address to send emails from

   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. You can update your API base URL if needed in `api.js` located inside the `src` folder:
   ```bash
   baseURL: "http://localhost:5000/api"
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```

## Usage

1. Ensure both the backend and frontend servers are running.
2. Open your web browser and navigate to http://localhost:3000.

### User Instructions

- **Sign Up**: Create a new account using the signup form.
- **Login**: Log in using your credentials.
- **Navigation**: Use the bottom navigation bar to easily switch between different sections of the app:
  - **Profile**: Access your profile to view and update your personal information.
  - **Add Friends**: Search for and send friend requests to other users. Here you can also see the friend list at the bottom.
  - **Requests**: View and manage incoming friend requests. Accept or decline incoming friend requests.
  - **Chats**: Initiate a conversation with friends by selecting their name from your friend list. Send text messages, share images, view the friend's profile and delete entire conversations when needed.
