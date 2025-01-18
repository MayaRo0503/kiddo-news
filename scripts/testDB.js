// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require("mongoose");

async function testDB() {
  const uri =
    "mongodb+srv://mayaro:6paxlFyxO5kXD4Ps@cluster0.rih2s.mongodb.net/kiddo-news?retryWrites=true&w=majority";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB!");

    const Admin = mongoose.model(
      "Admin",
      new mongoose.Schema({ role: String })
    );
    const admin = await Admin.findOne({ role: "admin" });
    console.log("Admin found:", admin);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
}

testDB();
