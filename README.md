
  # 🌟 Kiddo News 📰
  
  *Empowering young minds with safe, engaging news!* 🧠💡

  [![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)](https://nextjs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
</div>

---

## 🚀 Overview

Kiddo News is not just another news platform - it's a revolutionary, child-friendly news ecosystem! 🌈 We've crafted a safe haven where young minds can explore the world's happenings without worry. With separate interfaces for kids and parents, we ensure that learning stays fun and safe! 🛡️👨‍👩‍👧‍👦

---

## ✨ Features That Wow!

### 🔐 User Authentication
- 🧒👨‍👩‍👧 Separate logins for kids and parents
- 🎭 Parent-managed child accounts
- 🔒 Fort Knox-level security with JWT

### 📚 Content Management
- 🏷️ Kid-friendly categorized articles
- 👍💾💬 Interactive features: Like, Save, Comment
- 🚦 Parental content filters

### 👨‍👩‍👧‍👦 Parental Superpowers
- 📊 Monitor your child's digital journey
- ⏰ Set healthy time limits
- 👍 Approve new explorers (child registration)

### 🎨 User Experience Magic
- 📱 Responsive UI that dances across devices
- 🌙 Soothing dark mode for night owls
- 🌊 Smooth scrolling that feels like surfing the web

---

## 🏗️ Project Architecture

Our project is a monolithic marvel built with Next.js! Here's a peek into our folder structure:

```

/kiddo-news
│── 📁 /app                # Where the magic happens
│   ├── 🔐 /auth           # Fort Knox of our app
│   ├── 📰 /articles       # News central
│   ├── 👶 /child          # Kid's corner
│   ├── 👨‍👩‍👧 /parent         # Parent's command center
│   ├── 🧩 /components     # LEGO bricks of our UI
│   ├── 🌍 /contexts       # Global state magic
│   ├── 📊 /models         # Data blueprints
│   ├── 🛠️ /lib            # Utility belt
│   ├── 📝 /types          # TypeScript's playground
|   |── 🚀 /api            # Our backend superheroes
│── 🖼️ /public             # Asset gallery
│── 🎨 /styles             # TailwindCSS fashion studio
│── 🔑 .env                # Secret vault
│── ⚙️ next.config.js      # Next.js control panel
│── 🌈 tailwind.config.ts  # TailwindCSS magic wand
│── 📘 README.md           # You are here!


```
## 🚀 Blast Off: Installation

### 🛠️ Prerequisites
- Node.js (v16+ space-grade)
- MongoDB (self-hosted or cloud-nine Atlas)
- OpenAI API Key (for our AI guardian)

### 🧙‍♂️ Magical Setup Steps


1. **Clone the cosmic repository**  
   ```shellscript
   git clone https://github.com/your-username/kiddo-news.git
   cd kiddo-news
   ```


2. **Summon the dependencies**

```shellscript
npm install
```


3. **Craft your secret spell book (.env)**

```plaintext
MONGODB_URI=<your-galactic-mongodb-string>
JWT_SECRET=<your-secret-incantation>
EMAIL_USER=<your-owl-email>
EMAIL_PASS=<your-owl-password>
OPENAI_API_KEY=<your-ai-philosopher-stone>
```


4. **Ignite the development engines**

```shellscript
npm run dev
```


5. **Open the portal**Navigate to `http://localhost:3000` in your favorite browser!


---

## 🧠 The Brains of the Operation

- **🔐 Authentication (`auth.service.ts`)**: Our digital bouncer
- **💾 Database (`mongodb.ts`)**: The vault of knowledge
- **📰 Article Management (`Article.ts`)**: The newsroom
- **👨‍👩‍👧‍👦 User Management (`User.ts`)**: The family organizer
- **🎨 UI Components**: Our digital paintbrushes


---

## 🛣️ API Routes: The Information Superhighways

- 🔑 `/api/auth/login`: The grand entrance
- 📚 `/api/articles`: The library index
- ❤️ `/api/articles/:id/like`: The applause meter
- 💾 `/api/articles/:id/save`: The bookmarking wizard


---

## 🛠️ Our Toolkit

- **🎭 Frontend**: React, Next.js, TailwindCSS
- **🏗️ Backend**: Next.js API Routes, MongoDB (Mongoose)
- **🔐 Authentication**: JWT, bcrypt
- **📧 Email Services**: Nodemailer
- **🤖 AI Guardian**: OpenAI API


---

## 🚨 Important Transmissions

- 🔑 **OpenAI API key required!**
- 🏃‍♂️ **Ensure MongoDB is up and running**
- 🛡️ **Secure those env variables for production launch!**


---

## 🔮 Future Enhancements

- 👑 **Admin Panel**: For our content guardians
- 🕷️ **Automated Article Fetching**: Web-crawling news bots
- 🛡️ **Enhanced Child Safety**: AI-powered content shield


---

## 📜 License

This project is protected by the mighty **MIT License**.
