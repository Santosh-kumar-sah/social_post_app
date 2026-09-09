import { apiClient } from './client';
import { Post, LikeItem, CommentItem } from '../types';

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

export const fetchPostsApi = async (limit = 15, before?: string): Promise<PostsResponse> => {
  const params: Record<string, string | number> = { limit };
  if (before) {
    params.before = before;
  }
  const response = await apiClient.get<PostsResponse>('/posts', { params });
  return response.data;
};

export const createPostApi = async (formData: FormData): Promise<CreatePostResponse> => {
  const response = await apiClient.post<CreatePostResponse>('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const toggleLikeApi = async (postId: string): Promise<LikeResponse> => {
  const response = await apiClient.post<LikeResponse>(`/posts/${postId}/like`);
  return response.data;
};

export const addCommentApi = async (postId: string, text: string): Promise<CommentResponse> => {
  const response = await apiClient.post<CommentResponse>(`/posts/${postId}/comment`, { text });
  return response.data;
};
