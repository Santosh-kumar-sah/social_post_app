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

export interface PostsResponse {
  success: boolean;
  count: number;
  hasMore: boolean;
  posts: Post[];
  message?: string;
}

export interface CreatePostResponse {
  success: boolean;
  message?: string;
  post: Post;
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likesCount: number;
  likes: LikeItem[];
  message?: string;
}

export interface CommentResponse {
  success: boolean;
  message?: string;
  comment: CommentItem;
  comments: CommentItem[];
  commentCount: number;
}
