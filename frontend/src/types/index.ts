export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface LoginCredentials {
  identifier: string; // username or email
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

// Data types for Posts in Phase 2 & 3
export interface LikeItem {
  userId: string;
  username: string;
}

export interface CommentItem {
  _id?: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  text?: string;
  imageUrl?: string;
  likes: LikeItem[];
  comments: CommentItem[];
  createdAt: string;
}
