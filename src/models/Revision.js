const mongoose = require("mongoose");

const revisionSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, maxlength: 2_000_000 },
  version: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Revision", revisionSchema);
