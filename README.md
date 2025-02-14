

```markdown
# Kiddo News

## Overview
Kiddo News is an accessible news platform designed specifically for children, ensuring a safe and engaging environment for consuming news content. The platform offers separate interfaces for children and parents, allowing parental control over accessible content and monitoring of children's reading activity.

## Features
- **User Authentication**  
  - Separate login for parents and children.  
  - Parents can manage child accounts.  
  - JWT-based authentication.  
- **Content Management**  
  - Articles are categorized and filtered for child-friendly consumption.  
  - Children can like, save, and comment on articles.  
  - Parental content restriction settings.  
- **Parental Controls**  
  - Monitor child’s activity and interaction history.  
  - Set time limits for usage.  
  - Approve child registration.  
- **User Experience Enhancements**  
  - Responsive UI with mobile-friendly navigation.  
  - Dark mode support.  
  - Smooth navigation with horizontal article scrolling.  

## Project Architecture
The project follows a **monolithic** structure with Next.js for both frontend and backend handling. Below is the folder structure:

```
/kiddo-news
│── /app                 # Main application directory
│   ├── /auth            # Handles authentication flows
│   ├── /articles        # Article-related components & APIs
│   ├── /child           # Child profile management
│   ├── /parent          # Parent profile and control panel
│   ├── /components      # Reusable UI components
│   ├── /contexts        # Context providers (AuthContext)
│   ├── /models          # MongoDB models (User, Article)
│   ├── /lib             # Utility functions (e.g., database connection)
│   ├── /types           # TypeScript type definitions
│── /public              # Static assets
│── /styles              # TailwindCSS configuration
│── .env                 # Environment variables (API Keys)
│── next.config.js       # Next.js configuration
│── tailwind.config.ts   # TailwindCSS configuration
│── README.md            # Project documentation
```

## Installation

### Prerequisites
Before starting, ensure you have the following installed:
- **Node.js** (>= 16.x)
- **MongoDB** (self-hosted or cloud-based like MongoDB Atlas)
- **An OpenAI API Key** (Required for content filtering)

### Steps to Set Up the Project
1. **Clone the repository**  
   ```sh
   git clone https://github.com/your-username/kiddo-news.git
   cd kiddo-news
   ```

2. **Install dependencies**  
   ```sh
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory and add the required variables:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-secret-key>
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-email-password>
   OPENAI_API_KEY=<your-openai-key>
   ```

4. **Start the development server**  
   ```sh
   npm run dev
   ```

5. **Access the application**  
   Open `http://localhost:3000` in your browser.

## Key Components
### Authentication (`auth.service.ts`)
- Handles user login and registration.
- Uses **bcrypt** for password hashing.
- Generates **JWT tokens** for authentication.

### Database (`mongodb.ts`)
- Connects the app to **MongoDB**.
- Uses **mongoose** for schema validation.

### Article Management (`Article.ts`)
- Defines the **Article** model.
- Manages article CRUD operations.

### Parent & Child Management (`User.ts`)
- Defines **Parent** and **Child** schemas.
- Parents can set **time limits** and **approve children**.

### UI Components (`Header.tsx`, `LoginForm.tsx`)
- Implements **React hooks** for authentication and navigation.

### API Routes
The project uses **Next.js API Routes** to handle backend logic:
- `/api/auth/login` → Handles user authentication.
- `/api/articles` → Fetches available articles.
- `/api/articles/:id/like` → Manages article likes.
- `/api/articles/:id/save` → Manages saved articles.

## Technologies Used
- **Frontend:** React, Next.js, TailwindCSS  
- **Backend:** Next.js API Routes, MongoDB (Mongoose)  
- **Authentication:** JWT, bcrypt  
- **Email Services:** Nodemailer  
- **AI Integration:** OpenAI API for content filtering  

## Important Notes
- **This project requires an OpenAI API key** for proper functionality.  
- **Ensure MongoDB is running** before starting the app.  
- **For production**, replace environment variables with secure values.  

## Future Enhancements
- **Admin Panel** for content moderation.  
- **Automated Article Fetching** using web crawlers.  
- **Enhanced Child Safety Features** with AI-based content monitoring.  

## License
This project is licensed under the **MIT License**.

---

```
