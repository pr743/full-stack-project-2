import mongoose from "mongoose";

const tokenCounterSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  lastToken: {
    type: Number,
    default: 0,
  },
});

tokenCounterSchema.index({ doctor: 1, hospital: 1, date: 1 }, { unique: true });

export default mongoose.model("TokenCounter", tokenCounterSchema);
