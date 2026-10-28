const Document = require("../models/Document");

async function getDocumentAccess(documentId, userId) {
  const doc = await Document.findById(documentId).populate("owner", "name email");
  if (!doc) return { error: { status: 404, message: "Document not found" } };
  const uid = userId.toString();
  if (doc.owner._id.toString() === uid) return { doc, role: "owner" };
  const collaborator = doc.collaborators.find((c) => c.user.toString() === uid);
  if (!collaborator) return { error: { status: 403, message: "You do not have access to this document" } };
  return { doc, role: collaborator.role };
}
module.exports = { getDocumentAccess };
