import mongoose, { Schema, Document } from 'mongoose';

export interface ILike {
  userId: mongoose.Types.ObjectId;
  username: string;
}

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  text: string;
  createdAt: Date;
}

export interface IPostDocument extends Document {
  authorId: mongoose.Types.ObjectId;
  authorUsername: string;
  authorAvatarUrl?: string;
  text?: string;
  imageUrl?: string;
  likes: ILike[];
  comments: IComment[];
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const CommentSchema = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const PostSchema = new Schema<IPostDocument>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
      index: true,
    },
    authorUsername: {
      type: String,
      required: [true, 'Author username is required'],
      trim: true,
    },
    authorAvatarUrl: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Post text cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    likes: {
      type: [LikeSchema],
      default: [],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'posts', // Strictly adheres to the 2-collection constraint: 'users' and 'posts'
    timestamps: false,
  }
);

// Index for newest-first public feed queries
PostSchema.index({ createdAt: -1 });

export default mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);
