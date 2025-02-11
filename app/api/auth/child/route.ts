// import { authenticateToken } from "@/app/api/auth/common/middleware";
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import User from "@/models/User";

// export async function GET(req: Request) {
//   await dbConnect();

//   // Authenticate the user using the middleware
//   const user = authenticateToken(req);
//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   // Ensure the user is a child
//   if (user.role !== "child") {
//     return NextResponse.json(
//       { error: "Access restricted to children only" },
//       { status: 403 }
//     );
//   }

//   // Fetch child data from the parent's record
//   const parent = await User.findById(user.userId).select("-password");
//   if (!parent || !parent.child) {
//     return NextResponse.json(
//       { error: "Child profile not found" },
//       { status: 404 }
//     );
//   }

//   return NextResponse.json({
//     message: "Child profile fetched successfully",
//     child: parent.child,
//   });
// }
// app/api/auth/child/route.ts
import { authenticateToken } from "@/app/api/auth/common/middleware";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import RawArticle from "@/models/RawArticle";

export async function GET(req: Request) {
  await dbConnect();

  // Authenticate the user using the middleware
  const user = await authenticateToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Ensure the user is a child
  if (user.role !== "child") {
    return NextResponse.json(
      { error: "Access restricted to children only" },
      { status: 403 }
    );
  }

  // Fetch child data from the parent's record
  const parent = await User.findById(user.userId).select("-password");
  if (!parent || !parent.child) {
    return NextResponse.json(
      { error: "Child profile not found" },
      { status: 404 }
    );
  }

  // Retrieve the arrays of liked and saved article IDs
  const likedArticleIds = parent.child.likedArticles;
  const savedArticleIds = parent.child.savedArticles;

  // Fetch article objects (with _id and title) for liked articles
  const likedArticles = await RawArticle.find({ _id: { $in: likedArticleIds } })
    .select("_id title")
    .lean();

  // Fetch article objects (with _id and title) for saved articles
  const savedArticles = await RawArticle.find({ _id: { $in: savedArticleIds } })
    .select("_id title")
    .lean();

  // Attach the fetched articles to the child profile data.
  // This creates new fields 'likedArticles' and 'savedArticles' with full article objects.
  const childData = {
    ...parent.child.toObject(),
    likedArticles,
    savedArticles,
  };

  return NextResponse.json({
    message: "Child profile fetched successfully",
    child: childData,
  });
}
