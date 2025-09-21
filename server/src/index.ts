import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createWebSocketServer } from "./websocket";

import orderRoutes from "./routes/orderRoutes";

const app = express();
const server = createServer(app);
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.use("/api", orderRoutes);

createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 Matching engine server running at http://localhost:${PORT}`);
});
