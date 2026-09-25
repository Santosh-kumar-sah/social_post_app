# ⚡ Pulse — Mini Social Post Application

> A modern, editorial mini social platform built with the MERN stack. Featuring dark/light theming, instant micro-interactions, optimistic updates, and a strictly 2-collection MongoDB design.

### 🔗 Live Links

| Resource | URL |
|----------|-----|
| 🌐 **Live App** | [socialtaskplanet.vercel.app](https://socialtaskplanet.vercel.app/) |
| 📦 **GitHub** | [github.com/Santosh-kumar-sah/social_post_app](https://github.com/Santosh-kumar-sah/social_post_app) |
| 🗄️ **MongoDB Atlas** | [MongoDB Explorer](https://cloud.mongodb.com/v2/68fd191819a7525908ebef71#/explorer/68fd192c091d8d7d1278a8de/taskplanet) |

---

## 📸 Features at a Glance

- **🔐 Authentication** — Secure signup/login with JWT + bcrypt password hashing
- **📝 Create Posts** — Text posts with optional image upload via Cloudinary
- **❤️ Like System** — Animated heart burst with optimistic UI & likers avatar-stack popover
- **💬 Comments** — Responsive slide-in drawer (side panel on desktop, bottom sheet on mobile)
- **♾️ Infinite Scroll** — Cursor-based pagination with IntersectionObserver
- **🌗 Dark / Light Theme** — One-click toggle with persistent user preference
- **📱 Fully Responsive** — Adaptive layouts for mobile, tablet, and desktop
- **💀 Skeleton Loading** — Smooth animated placeholders while content loads

---

## 🏗️ Architecture: The "2 Collections Only" Design

A core constraint of this project: **strictly two MongoDB collections** — `users` and `posts`.

Likes and comments are embedded directly inside each post document:

```json
{
  "_id": "ObjectId(...)",
  "authorId": "ObjectId(User)",
  "authorUsername": "alex_chen",
  "text": "Designing something new for the social web.",
  "imageUrl": "https://res.cloudinary.com/...",
  "likes": [
    { "userId": "ObjectId(User)", "username": "sora_pulse" }
  ],
  "comments": [
    {
      "userId": "ObjectId(User)",
      "username": "sora_pulse",
      "text": "The micro-interactions feel immediate!",
      "createdAt": "2026-09-09T00:00:00.000Z"
    }
  ],
  "createdAt": "2026-09-09T00:00:00.000Z"
}
```

**Why this approach?**

| Benefit | Detail |
|---------|--------|
| **Zero-join reads** | A single `Post.find()` query returns everything — author, content, likes, comments — in one pass |
| **Atomic operations** | Likes/comments are pushed/pulled atomically using MongoDB operators, no multi-document transactions |
| **Optimistic UI** | Client can instantly manipulate embedded arrays locally with safe rollback |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework with type safety |
| Vite | Fast build tool & dev server |
| Material UI (MUI v5) | Component library & theming |
| Framer Motion | Micro-interaction animations |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| date-fns | Lightweight date formatting |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM (2 collections) |
| JWT + bcryptjs | Authentication & password hashing |
| Multer + Cloudinary | Image upload & cloud storage |
| CORS | Origin whitelist security |

### Deployment
| Service | Layer |
|---------|-------|
| **Vercel** | Frontend hosting with SPA rewrites |
| **Render** | Backend API hosting |
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Image CDN & storage |

---

## 🎨 Design System

| Element | Detail |
|---------|--------|
| **Dark BG** | Deep Charcoal `#12141A` |
| **Light BG** | Warm Off-white `#FAF8F5` |
| **Primary Accent** | Electric Coral `#FF5C5C` |
| **Secondary Accent** | Muted Amber `#E8B04B` |
| **Heading Font** | Space Grotesk |
| **Body Font** | Inter |
| **Card Style** | Soft elevation, 1px hairline border, 16px border-radius |
| **Like Animation** | Framer Motion scale + rotational bounce |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)
- npm

### 1. Clone
```bash
git clone https://github.com/Santosh-kumar-sah/social_post_app.git
cd social_post_app
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run dev             # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd ../frontend
npm install
cp .env.example .env   # then fill in your values
npm run dev             # starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Express server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123...` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register with username, email, password | Public |
| `POST` | `/api/auth/login` | Login with username/email + password | Public |
| `GET` | `/api/auth/me` | Get authenticated user profile | 🔒 Bearer |

### Posts — `/api/posts`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/posts` | Feed with cursor pagination (`?before=<ISO>&limit=10`) | Public |
| `POST` | `/api/posts` | Create post (text/image/both) | 🔒 Bearer |
| `POST` | `/api/posts/:id/like` | Toggle like/unlike | 🔒 Bearer |
| `POST` | `/api/posts/:id/comment` | Add a comment | 🔒 Bearer |

### Health — `/api`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service & DB connectivity check |

---

## 📂 Project Structure

```
social_post_app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js    # Cloudinary SDK config
│   │   │   ├── constants.js     # Centralized app constants
│   │   │   └── db.js            # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Signup, login, profile logic
│   │   │   └── postController.js   # CRUD, like, comment logic
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification middleware
│   │   │   └── upload.js        # Multer file upload config
│   │   ├── models/
│   │   │   ├── Post.js          # Post schema (embeds likes & comments)
│   │   │   └── User.js          # User schema
│   │   ├── routes/
│   │   │   ├── auth.js          # Auth route definitions
│   │   │   ├── health.js        # Health check route
│   │   │   └── posts.js         # Post route definitions
│   │   ├── utils/
│   │   │   └── response.js      # sendSuccess() / sendError() helpers
│   │   └── server.js            # Express entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts          # Auth API calls
│   │   │   ├── client.ts        # Axios instance + interceptors
│   │   │   ├── posts.ts         # Post API calls
│   │   │   └── index.ts         # Barrel export
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── ThemePreview.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   ├── UserAvatar.tsx    # Reusable avatar component
│   │   │   │   └── index.ts
│   │   │   ├── feed/
│   │   │   │   ├── CommentDrawer.tsx
│   │   │   │   ├── ComposeBox.tsx
│   │   │   │   ├── EmptyFeed.tsx
│   │   │   │   ├── LikersPopover.tsx
│   │   │   │   ├── PostCard.tsx
│   │   │   │   └── index.ts
│   │   │   └── skeleton/
│   │   │       ├── PostSkeleton.tsx
│   │   │       └── index.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # JWT session management
│   │   │   └── ThemeContext.tsx  # Dark/Light theme state
│   │   ├── pages/
│   │   │   ├── FeedPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── index.ts
│   │   ├── theme/
│   │   │   └── theme.ts         # MUI theme tokens
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── avatar.ts        # DiceBear avatar helpers
│   │   │   ├── date.ts          # Relative time formatting
│   │   │   ├── storage.ts       # Type-safe localStorage wrapper
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json              # SPA rewrite rules
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📜 License

MIT

---

**Built by [Santosh Kumar Sah](https://github.com/Santosh-kumar-sah)**
