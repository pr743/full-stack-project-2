import mongoose from "mongoose";
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    avgConsultTime: {
      type: Number,
      default: 15,
    },

    dailyLimit: {
      type: Number,
      default: 20,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    
    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },




    currentPatients:{
      type:Number,
      default:0,
    },

    isOnline:{
      type:Boolean,
      default:true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
