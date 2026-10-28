const { Server } = require("socket.io");
const User = require("./models/User");
const Document = require("./models/Document");
const Revision = require("./models/Revision");
const { verifyToken } = require("./utils/jwt");

function getRole(doc, userId) {
  if (doc.owner.toString() === userId.toString()) return "owner";
  const collaborator = doc.collaborators.find((c) => c.user.toString() === userId.toString());
  return collaborator ? collaborator.role : null;
}

function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN
        ? process.env.CLIENT_ORIGIN.split(",").map((v) => v.trim())
        : true,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication token required"));
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error("Invalid user"));
      socket.user = { id: user._id.toString(), name: user.name };
      next();
    } catch (_err) {
      next(new Error("Invalid or expired token"));
    }
  });

  const presence = new Map(); // documentId -> Map(userId -> {name, sockets:Set})
  const emitPresence = (documentId) => {
    const members = presence.get(documentId);
    const users = members ? [...members.entries()].map(([userId, info]) => ({ userId, name: info.name })) : [];
    io.to(`document:${documentId}`).emit("presence:update", { documentId, users });
  };

  io.on("connection", (socket) => {
    socket.on("document:join", async ({ documentId } = {}) => {
      try {
        if (!documentId || !/^[a-f\d]{24}$/i.test(documentId)) throw new Error("Valid documentId is required");
        const doc = await Document.findById(documentId);
        if (!doc) throw new Error("Document not found");
        const role = getRole(doc, socket.user.id);
        if (!role) throw new Error("You do not have access to this document");
        const room = `document:${documentId}`;
        await socket.join(room);
        if (!presence.has(documentId)) presence.set(documentId, new Map());
        const members = presence.get(documentId);
        if (!members.has(socket.user.id)) members.set(socket.user.id, { name: socket.user.name, sockets: new Set() });
        members.get(socket.user.id).sockets.add(socket.id);
        socket.data.documentId = documentId;
        socket.emit("document:joined", { documentId, content: doc.content, version: doc.version, role });
        emitPresence(documentId);
      } catch (err) {
        socket.emit("document:error", { message: err.message || "Unable to join document" });
      }
    });

    socket.on("document:update", async (payload = {}) => {
      try {
        const { documentId, content, clientVersion } = payload;
        if (!documentId || typeof content !== "string") throw new Error("documentId and string content are required");
        if (content.length > 2_000_000) throw new Error("Document content exceeds 2 MB");
        if (socket.data.documentId !== documentId) throw new Error("Join the document before editing");
        const doc = await Document.findById(documentId);
        if (!doc) throw new Error("Document not found");
        const role = getRole(doc, socket.user.id);
        if (!role || role === "viewer") throw new Error("Editor access required");
        const nextVersion = doc.version + 1;
        doc.content = content;
        doc.version = nextVersion;
        await doc.save();
        await Revision.create({ document: doc._id, author: socket.user.id, content, version: nextVersion });
        // Keep revision history bounded.
        const oldRevisions = await Revision.find({ document: doc._id }).sort({ createdAt: -1 }).skip(100).select("_id");
        if (oldRevisions.length) await Revision.deleteMany({ _id: { $in: oldRevisions.map((r) => r._id) } });
        io.to(`document:${documentId}`).emit("document:updated", {
          documentId, content, version: nextVersion, updatedBy: socket.user.id,
          updatedAt: doc.updatedAt, clientVersion: Number.isInteger(clientVersion) ? clientVersion : undefined
        });
      } catch (err) {
        socket.emit("document:error", { message: err.message || "Unable to update document" });
      }
    });

    socket.on("document:cursor", ({ documentId, cursor } = {}) => {
      if (!documentId || socket.data.documentId !== documentId) return;
      socket.to(`document:${documentId}`).emit("document:cursor", {
        userId: socket.user.id, name: socket.user.name, cursor
      });
    });

    socket.on("document:leave", ({ documentId } = {}) => {
      leaveDocument(socket, documentId);
    });

    function leaveDocument(currentSocket, documentId) {
      const id = documentId || currentSocket.data.documentId;
      if (!id) return;
      currentSocket.leave(`document:${id}`);
      const members = presence.get(id);
      if (members && members.has(currentSocket.user.id)) {
        members.get(currentSocket.user.id).sockets.delete(currentSocket.id);
        if (members.get(currentSocket.user.id).sockets.size === 0) members.delete(currentSocket.user.id);
        if (members.size === 0) presence.delete(id);
      }
      emitPresence(id);
      if (currentSocket.data.documentId === id) delete currentSocket.data.documentId;
    }

    socket.on("disconnect", () => leaveDocument(socket));
  });
  return io;
}
module.exports = { attachSocketServer };
