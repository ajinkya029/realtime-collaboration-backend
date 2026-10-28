const mongoose = require("mongoose");
const User = require("../models/User");
const Document = require("../models/Document");
const Revision = require("../models/Revision");
const { getDocumentAccess } = require("../middleware/documentAccess");

const publicDoc = (doc, role) => ({
  id: doc._id, title: doc.title, content: doc.content, owner: doc.owner,
  collaborators: doc.collaborators, version: doc.version, createdAt: doc.createdAt,
  updatedAt: doc.updatedAt, role
});

async function createDocument(req, res) {
  const title = typeof req.body.title === "string" && req.body.title.trim() ? req.body.title.trim() : "Untitled document";
  const content = typeof req.body.content === "string" ? req.body.content : "";
  const doc = await Document.create({ title, content, owner: req.user._id });
  res.status(201).json({ document: publicDoc(doc, "owner") });
}

async function listDocuments(req, res) {
  const docs = await Document.find({
    $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }]
  }).sort({ updatedAt: -1 }).populate("owner", "name email");
  res.json({ documents: docs.map((d) => publicDoc(d, d.owner._id.toString() === req.user._id.toString()
    ? "owner" : d.collaborators.find((c) => c.user.toString() === req.user._id.toString()).role)) });
}

async function getOne(req, res) {
  const access = await getDocumentAccess(req.params.id, req.user._id);
  if (access.error) return res.status(access.error.status).json({ message: access.error.message });
  res.json({ document: publicDoc(access.doc, access.role) });
}

async function updateMetadata(req, res) {
  const access = await getDocumentAccess(req.params.id, req.user._id);
  if (access.error) return res.status(access.error.status).json({ message: access.error.message });
  if (access.role !== "owner" && access.role !== "editor") return res.status(403).json({ message: "Editor access required" });
  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string" || !req.body.title.trim()) return res.status(400).json({ message: "title must be a non-empty string" });
    access.doc.title = req.body.title.trim().slice(0, 200);
  }
  await access.doc.save();
  res.json({ document: publicDoc(access.doc, access.role) });
}

async function deleteDocument(req, res) {
  const access = await getDocumentAccess(req.params.id, req.user._id);
  if (access.error) return res.status(access.error.status).json({ message: access.error.message });
  if (access.role !== "owner") return res.status(403).json({ message: "Only the owner can delete this document" });
  await Promise.all([Document.deleteOne({ _id: access.doc._id }), Revision.deleteMany({ document: access.doc._id })]);
  res.json({ message: "Document deleted" });
}

async function shareDocument(req, res) {
  const { email, role = "editor" } = req.body;
  if (!email || !["viewer", "editor"].includes(role)) return res.status(400).json({ message: "Valid email and role (viewer/editor) are required" });
  const access = await getDocumentAccess(req.params.id, req.user._id);
  if (access.error) return res.status(access.error.status).json({ message: access.error.message });
  if (access.role !== "owner") return res.status(403).json({ message: "Only the owner can manage sharing" });
  const target = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!target) return res.status(404).json({ message: "No registered user found with that email" });
  if (target._id.equals(access.doc.owner._id)) return res.status(400).json({ message: "Owner already has access" });
  const existing = access.doc.collaborators.find((c) => c.user.equals(target._id));
  if (existing) existing.role = role;
  else access.doc.collaborators.push({ user: target._id, role });
  await access.doc.save();
  await access.doc.populate("collaborators.user", "name email");
  res.json({ document: publicDoc(access.doc, "owner") });
}

async function removeCollaborator(req, res) {
  const access = await getDocumentAccess(req.params.id, req.user._id);
  if (access.error) return res.status(access.error.status).json({ message: access.error.message });
  if (access.role !== "owner") return res.status(403).json({ message: "Only the owner can manage sharing" });
  access.doc.collaborators = access.doc.collaborators.filter((c) => c.user.toString() !== req.params.userId);
  await access.doc.save();
  res.json({ message: "Collaborator removed" });
}

async function listRevisions(req, res) {
  const access = await getDocumentAccess(req.params.id, req.user._id);
  if (access.error) return res.status(access.error.status).json({ message: access.error.message });
  const revisions = await Revision.find({ document: access.doc._id }).sort({ createdAt: -1 }).limit(50)
    .populate("author", "name email").select("-content");
  res.json({ revisions });
}
module.exports = { createDocument, listDocuments, getOne, updateMetadata, deleteDocument, shareDocument, removeCollaborator, listRevisions };
