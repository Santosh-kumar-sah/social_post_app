# ⚡ Pulse — Mini Social Post Application

> A modern, editorial mini social platform crafted for the Full Stack Internship assignment. Built with an editorial dark/light aesthetic, instant micro-interactions, optimistic updates, and strict database normalization constraints.

---

## 🌟 Architecture Highlight: The "2 Collections Only" Design Choice

A primary non-negotiable constraint of this project was to use **strictly two MongoDB collections**:
1. `users`
2. `posts`

### Why Embedded Arrays Instead of Separate Collections?
Rather than creating separate collections for `likes` and `comments`, Pulse embeds them directly inside each document in `posts`:
```json
{
  "_id": "ObjectId(...)",
  "authorId": "ObjectId(User)",
  "authorUsername": "alex_chen",
  "authorAvatarUrl": "https://...",
  "text": "Designing something new for the social web.",
  "imageUrl": "https://...",
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

#### Key Technical Benefits:
- **Zero-Join Reads ($O(1)$ post fetch)**: Feed queries require zero `$lookup` or relational joins. A single query `Post.find().sort({ createdAt: -1 })` returns the author information, content, like count, comment count, and liker usernames in one pass.
- **Atomic Concurrency**: Likes and comments are pushed/pulled atomically using MongoDB operators without multi-document transaction overhead.
- **Immediate Micro-Interactions**: The client can optimistically manipulate the embedded arrays locally with instant rollback safety.

---

## 🎨 Design System — "Pulse" Identity

- **Palette**: Deep Charcoal (`#12141A`) background in dark mode / warm off-white (`#FAF8F5`) in light mode.
- **Signature Accents**: Electric Coral (`#FF5C5C`) for action triggers & like bursts; Muted Amber (`#E8B04B`) for secondary badges and highlights.
- **Typography**: Expressive **Space Grotesk** for headings and author handles + clean **Inter** for body text and form controls.
- **Post Cards**: Soft elevation, 1px subtle hairline border, and 16px border-radius (`rounded-xl` via MUI `shape.borderRadius`).
- **Heart Burst Animation**: Framer Motion scale + rotational bounce (`[1, 1.45, 0.9, 1]`) on like.
- **Likers Avatar-Stack**: Hovering on the like count displays a sleek floating MUI `Popper` showing avatar stacks and usernames of who liked the post.
- **Slide-Up Discussion Drawer**: MUI `Drawer` slides up smoothly from the bottom, keeping the main feed clean and scannable.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Components**: Material UI (MUI v5+) *(TailwindCSS is strictly banned)*
- **Micro-Interactions**: Framer Motion
- **Routing**: React Router v6
- **HTTP Client**: Axios with automatic JWT Authorization interceptor
- **State & Theming**: Custom `ThemeContext` (Dark/Light mode switcher) + `AuthContext` (JWT session management)

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose ODM (strictly 2 collections)
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration + `bcryptjs` password hashing (salt rounds 10)
- **Media Uploads**: Multer memory storage + Cloudinary API (with base64 Data URL fallback for local development)
- **Security**: CORS origin whitelist, input sanitization, and structured error boundaries

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ or v22+)
- MongoDB (local `mongod` service or MongoDB Atlas connection URI)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Santosh-kumar-sah/social_post_app.git
cd social_post_app
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env from .env.example
cp .env.example .env

# Run in development mode (hot reloading)
npm run dev

# Or build & start production server
npm run build
npm start
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env from .env.example
cp .env.example .env

# Start Vite dev server
npm run dev
```
*Frontend opens at `http://localhost:5173`.*

---

## 🔑 Environment Variables Reference

### Backend (`/backend/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port for Express API | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/pulse` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `pulse_super_secret_jwt_key` |
| `CLIENT_URL` | Allowed CORS frontend origin | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | *(optional for local dev)* |
| `CLOUDINARY_API_KEY` | Cloudinary API key | *(optional for local dev)* |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | *(optional for local dev)* |

### Frontend (`/frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base API URL | `http://localhost:5000/api` |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user with username, email, password | Public |
| `POST` | `/api/auth/login` | Authenticate with username/email + password | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |

### Posts & Feed (`/api/posts`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/posts` | Public feed with cursor pagination (`?before=<ISO>&limit=10`) | Public |
| `POST` | `/api/posts` | Create new post (text OR image OR both required) | Bearer Token |
| `POST` | `/api/posts/:id/like` | Toggle like/unlike with optimistic sync | Bearer Token |
| `POST` | `/api/posts/:id/comment`| Add comment to discussion thread | Bearer Token |

### Health (`/api/health`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service and MongoDB connectivity check |

---

## 📂 Project Structure

```
social_post_app/
├── backend/
│   ├── src/
│   │   ├── config/          # db.ts, cloudinary.ts
│   │   ├── controllers/     # authController.ts, postController.ts
│   │   ├── middleware/      # auth.ts, upload.ts
│   │   ├── models/          # User.ts (users), Post.ts (posts)
│   │   ├── routes/          # auth.ts, posts.ts, health.ts
│   │   ├── types/           # TypeScript interfaces
│   │   └── server.ts        # Express server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # client.ts, auth.ts, posts.ts
│   │   ├── components/
│   │   │   ├── common/      # Navbar, ThemeToggle, ErrorBoundary, ProtectedRoute
│   │   │   ├── feed/        # ComposeBox, PostCard, LikersPopover, CommentDrawer, EmptyFeed
│   │   │   └── skeleton/    # PostSkeleton, FeedSkeleton
│   │   ├── context/         # AuthContext.tsx, ThemeContext.tsx
│   │   ├── pages/           # FeedPage.tsx, LoginPage.tsx, SignupPage.tsx
│   │   ├── theme/           # theme.ts ("Pulse" theme tokens)
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 📜 License
MIT
