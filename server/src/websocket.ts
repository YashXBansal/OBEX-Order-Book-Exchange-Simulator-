import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import EventEmitter from "events";

// This emitter will act as a bridge between our engine and the WebSocket server
export const engineEmitter = new EventEmitter();

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("✅ Client connected via WebSocket");
    ws.on("close", () => console.log("❌ Client disconnected"));
  });

  // Listen for events from the engine and broadcast them to all clients
  engineEmitter.on("update", (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  console.log("🚀 WebSocket server initialized");
}
