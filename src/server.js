require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { attachSocketServer } = require("./socket");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  attachSocketServer(server);
  server.listen(PORT, () => console.log(`Collaboration API listening on port ${PORT}`));
}
start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
