require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("       🎵 SONICFLOW BACKEND");
    console.log("======================================");
    console.log(`Server listening on port: ${PORT}`);
    console.log(`Health check endpoint:   /api/health`);
    console.log("======================================");
    console.log("");
  });
}

startServer();