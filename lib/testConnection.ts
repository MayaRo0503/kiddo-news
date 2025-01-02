import dbConnect from "./mongodb";

async function testConnection() {
  try {
    await dbConnect();
    console.log("✅ התחברנו בהצלחה למונגו אטלס!");
  } catch (error) {
    console.error("❌ שגיאת התחברות:", error);
  } finally {
    // סיום התהליך
    process.exit(0);
  }
}

testConnection();
