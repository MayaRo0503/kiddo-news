import type { ObjectId, Document } from "mongoose";

export interface Child {
  name: string;
  username: string;
  savedArticles: string[];
  likedArticles: string[];
  timeLimit: number;
  sessionStartTime: Date | null;
  approvedByParent: boolean;
  lastLoginDate: Date | null;
  remainingTime: number;
  birthDate: Date;
  parentId: ObjectId;
  role: string;
  access_code: string;
}
export interface Parent {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  child: Child;
}

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  childName?: string;
  timeLimit?: number;
  createdAt: Date;
  password: string;
  role: string;
  child: Child;
  lastLogin: Date | null;
  updatedAt: Date | null;
  resetPasswordToken: string;
  resetPasswordExpires: Date | null;
  verified: boolean;
}

export interface IUserDocument extends Document, IUser {}

export interface IArticle {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  createdAt: Date;
}
