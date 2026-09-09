import { Request } from 'express';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface AuthUserPayload {
  userId: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
