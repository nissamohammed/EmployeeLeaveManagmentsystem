Running the Application Locally-Employee Leave Management System

Prerequisites
Ensure the following tools are installed on your system:

Node.js (v14 or above) - Download from Node.js Official Website.
npm or yarn - Comes with Node.js.
Git - Download from google

1. Clone the Repository

Open a terminal/command prompt.

Navigate to the directory where you want to store the project.

Run the following command to clone the repository:

git clone {url-specified in the git repository }

Navigate into the project directory:

cd {project-folder}

2. Install Dependencies

Ensure you are in the root directory of the project.
Install the required dependencies by running:
npm install
install neccessary packages if needed


3. Set up server url changed to

export const serverUrl = 'http://localhost:4000'

4. Run the application using:
 npm run dev

 5.  Troubleshooting
If you encounter issues:
Ensure all dependencies are installed.
Check if the backend server is running.
Verify that the .env file has the correct values.
Look at the terminal logs for error messages and resolve them accordingly.

6. Back End configuration
   1. clone using git hub repository
   2. npm install
   3. npm i cors dotenv express mongoose
   4. check .env file with below given:
.env file(back end) locally: 
DATABASE=mongodb://localhost:27017/leave_management
JWT_SECRET=leave_management_jwt_secret_2026
JWT_EXPIRES_IN=7d
PORT=4000
   5. run the server application:
  nodemon index.js

