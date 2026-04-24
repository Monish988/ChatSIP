# ChatSIP

ChatSIP is a full-stack real-time chat application built to provide a seamless communication experience. It features a modern user interface, secure authentication, and support for various media types in conversations.

## Core Features

The application includes several features designed for a complete messaging experience:

- Secure user authentication using JSON Web Tokens and HTTP-only cookies.
- Real-time messaging and presence tracking using Socket.io.
- Support for sending images and file attachments via Cloudinary integration.
- Message status tracking including delivery and read receipts.
- Interactive message reactions using emojis.
- User profile management with customizable profile pictures.
- Search functionality to find contacts by name, username, or email.

## Technical Architecture

The project is structured as a MERN stack application:

- **Frontend**: Built with React 19 and Vite. State management is handled by Zustand, and styling is implemented using Tailwind CSS and DaisyUI for a consistent and responsive design.
- **Backend**: An Express.js server running on Node.js. It uses Mongoose for database modeling and Socket.io for managing real-time events.
- **Security**: Integrated with Arcjet for rate limiting and bot protection.
- **Email**: Automated welcome emails are sent via Resend.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- A MongoDB database instance.
- Accounts with Cloudinary, Resend, and Arcjet for API keys.

### Installation

1. Clone the repository to your local environment.
2. Navigate to the root directory and install dependencies for both components:
   ```bash
   npm install
   ```
   (The root package.json is configured to handle installations for both backend and frontend).

3. Create a .env file in the backend directory and configure the necessary environment variables.

### Environment Variables

The following variables are required for the backend to function:

- DB_URL: Your MongoDB connection string.
- JWT_SECRET: A secret key for token signing.
- RESEND_API_KEY: API key for the Resend email service.
- CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name.
- CLOUDINARY_API_KEY: Your Cloudinary API key.
- CLOUDINARY_API_SECRET: Your Cloudinary API secret.
- ARCJET_API_KEY: Your Arcjet API key.
- CLIENT_URL: The URL where the frontend is hosted.

### Running the Application

To start the development environment:

1. For the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. For the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Deployment

The project is configured for deployment on Vercel for the frontend. For the backend, while Vercel supports serverless functions, it is recommended to use a platform that supports persistent WebSocket connections (like Render or Railway) if you require full real-time functionality.
