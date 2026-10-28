const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["viewer", "editor"], default: "viewer" }
}, { _id: false });

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200, default: "Untitled document" },
  content: { type: String, default: "", maxlength: 2_000_000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  collaborators: { type: [collaboratorSchema], default: [] },
  version: { type: Number, default: 0 }
}, { timestamps: true });

documentSchema.index({ "collaborators.user": 1 });
module.exports = mongoose.model("Document", documentSchema);
