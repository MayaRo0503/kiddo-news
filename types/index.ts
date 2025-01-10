export interface Child {
  name: string;
  savedArticles: string[];
  likedArticles: string[];
  timeLimit: number;
}

export interface Parent {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  child: Child;
}

// Make sure other interfaces are also exported if needed
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
