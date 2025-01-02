export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  childName?: string;
  timeLimit?: number;
  createdAt: Date;
}

export interface IArticle {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  createdAt: Date;
}
