// import { type NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import User from "@/models/User";
// import { authenticateToken } from "../../common/middleware";
// // import { isSameDay } from "date-fns";

// export async function POST(req: NextRequest) {
//   try {
//     await dbConnect();
//     const user = authenticateToken(req);

//     const username = user?.username as string;
//     if (!username) {
//       return NextResponse.json(
//         { error: "Username not found" },
//         { status: 404 }
//       );
//     }

//     const parent = await User.findOne({ "child.username": username });

//     if (!parent) {
//       return NextResponse.json({ error: "Child not found" }, { status: 404 });
//     }

//     const child = parent.child;
//     if (!child) {
//       return NextResponse.json({ error: "Invalid username" }, { status: 401 });
//     }

//     child.calculateRemainingTime(); // Call method to update time
//     // const now = new Date();

//     // // If it's a new day, reset timeSpent
//     // if (!isSameDay(now, child.lastLoginDate)) {
//     //   child.timeSpent = 0;
//     //   child.sessionStartTime = null;
//     //   child.lastLoginDate = now;
//     // }

//     // // Start a new session if necessary
//     // if (!child.sessionStartTime) {
//     //   child.sessionStartTime = now;
//     // } else {
//     //   // Calculate elapsed time
//     //   const elapsed = Math.floor(
//     //     (now.getTime() - child.sessionStartTime.getTime()) / (1000 * 60)
//     //   );
//     //   child.timeSpent = Math.min(child.timeSpent + elapsed, child.timeLimit);
//     // }

//     // // If time is up, reset sessionStartTime
//     // if (child.timeSpent >= child.timeLimit) {
//     //   child.sessionStartTime = null;
//     // }

//     await parent.save();

//     return NextResponse.json({
//       remainingTime: child.remainingTime,
//     });
//   } catch (error) {
//     console.error("Error tracking time:", error);
//     return NextResponse.json(
//       { error: "Failed to track time" },
//       { status: 500 }
//     );
//   }
// }

// **Updated Logic for sessionStartTime and timeSpent in track-time API**

import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "../../common/middleware";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateToken(req);

    const username = user?.username as string;
    if (!username) {
      return NextResponse.json(
        { error: "Username not found" },
        { status: 404 }
      );
    }

    const parent = await User.findOne({ "child.username": username });

    if (!parent) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const child = parent.child;
    if (!child) {
      return NextResponse.json({ error: "Invalid username" }, { status: 401 });
    }

    const now = new Date();
    const lastLogin = child.lastLoginDate
      ? new Date(child.lastLoginDate)
      : null;

    //     // // If it's a new day, reset timeSpent
    //     // if (!isSameDay(now, child.lastLoginDate)) {
    //     //   child.timeSpent = 0;
    //     //   child.sessionStartTime = null;
    //     //   child.lastLoginDate = now;
    //     // }

    //     // // Start a new session if necessary
    //     // if (!child.sessionStartTime) {
    //     //   child.sessionStartTime = now;
    //     // } else {
    //     //   // Calculate elapsed time
    //     //   const elapsed = Math.floor(
    //     //     (now.getTime() - child.sessionStartTime.getTime()) / (1000 * 60)
    //     //   );
    //     //   child.timeSpent = Math.min(child.timeSpent + elapsed, child.timeLimit);
    //     // }

    //     // // If time is up, reset sessionStartTime
    //     // if (child.timeSpent >= child.timeLimit) {
    //     //   child.sessionStartTime = null;
    //     // }

    // Reset timeSpent if the current date is different from lastLoginDate
    if (!lastLogin || now.toDateString() !== lastLogin.toDateString()) {
      child.timeSpent = 0;
      child.remainingTime = child.timeLimit;
      child.lastLoginDate = now;
    }

    if (
      child.sessionStartTime &&
      new Date(child.sessionStartTime).toDateString() === now.toDateString()
    ) {
      const timeSpentNow = Math.floor(
        (now.getTime() - new Date(child.sessionStartTime).getTime()) /
          (1000 * 60)
      );
      child.timeSpent += timeSpentNow;
      child.remainingTime = child.timeLimit - child.timeSpent;
    }

    //child.sessionStartTime = now;
    child.calculateRemainingTime();

    // Modify the logic to ensure timeSpent is properly reset and saved:
    if (!lastLogin || now.toDateString() !== lastLogin.toDateString()) {
      child.set("timeSpent", 0); // Use set to track changes
      child.set("remainingTime", child.timeLimit);
      child.set("lastLoginDate", now);
    }
    await parent.save();

    return NextResponse.json({
      remainingTime: child.remainingTime,
      timeSpent: child.timeSpent,
      sessionStartTime: child.sessionStartTime,
    });
  } catch (error) {
    console.error("Error tracking time:", error);
    return NextResponse.json(
      { error: "Failed to track time" },
      { status: 500 }
    );
  }
}
