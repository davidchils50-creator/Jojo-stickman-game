var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  const lobbies = /* @__PURE__ */ new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [code, lobby] of lobbies.entries()) {
      if (now - lobby.lastActive > 10 * 60 * 1e3) {
        lobbies.delete(code);
      }
    }
  }, 5 * 60 * 1e3);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeRooms: lobbies.size });
  });
  app.post("/api/relay/create", (req, res) => {
    const { hostId, offer, hostCharId } = req.body;
    if (!hostId || !offer) {
      res.status(400).json({ error: "Missing hostId or offer" });
      return;
    }
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomCode = "JJ";
    for (let i = 0; i < 4; i++) {
      roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newLobby = {
      roomCode,
      hostId,
      hostCharId: hostCharId || "jotaro",
      hostOffer: offer,
      hostIceCandidates: [],
      clientIceCandidates: [],
      status: "waiting",
      lastActive: Date.now()
    };
    lobbies.set(roomCode, newLobby);
    res.json({ roomCode });
  });
  app.get("/api/relay/list", (req, res) => {
    const activeRooms = Array.from(lobbies.values()).filter((lobby) => lobby.status === "waiting").map((lobby) => ({
      roomCode: lobby.roomCode,
      hostCharId: lobby.hostCharId,
      lastActive: lobby.lastActive
    }));
    res.json({ rooms: activeRooms });
  });
  app.post("/api/relay/join", (req, res) => {
    const { roomCode, clientId } = req.body;
    if (!roomCode || !clientId) {
      res.status(400).json({ error: "Missing roomCode or clientId" });
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    const lobby = lobbies.get(cleanCode);
    if (!lobby) {
      res.status(404).json({ error: "Room tidak ditemukan atau Host offline." });
      return;
    }
    lobby.clientId = clientId;
    lobby.status = "connected";
    lobby.lastActive = Date.now();
    res.json({
      hostOffer: lobby.hostOffer,
      hostId: lobby.hostId
    });
  });
  app.post("/api/relay/signal", (req, res) => {
    const { roomCode, senderId, answer, candidate } = req.body;
    if (!roomCode || !senderId) {
      res.status(400).json({ error: "Missing roomCode or senderId" });
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    const lobby = lobbies.get(cleanCode);
    if (!lobby) {
      res.status(404).json({ error: "Room tidak ditemukan." });
      return;
    }
    lobby.lastActive = Date.now();
    if (senderId === lobby.hostId) {
      if (candidate) {
        lobby.hostIceCandidates.push(candidate);
      }
    } else if (senderId === lobby.clientId) {
      if (answer) {
        lobby.clientAnswer = answer;
      }
      if (candidate) {
        lobby.clientIceCandidates.push(candidate);
      }
    }
    res.json({ success: true });
  });
  app.get("/api/relay/poll", (req, res) => {
    const { roomCode, myId } = req.query;
    if (!roomCode || !myId) {
      res.status(400).json({ error: "Missing roomCode or myId" });
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    const lobby = lobbies.get(cleanCode);
    if (!lobby) {
      res.status(404).json({ error: "Room tidak ditemukan." });
      return;
    }
    lobby.lastActive = Date.now();
    if (myId === lobby.hostId) {
      res.json({
        clientAnswer: lobby.clientAnswer,
        clientIceCandidates: lobby.clientIceCandidates
      });
    } else if (myId === lobby.clientId) {
      res.json({
        hostIceCandidates: lobby.hostIceCandidates
      });
    } else {
      res.status(403).json({ error: "Unauthorized access to room signal" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
