// import dotenv from "dotenv";
// import express from "express";

// import cors from "cors";
// import connectDb from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import doctorRoutes from "./routes/doctorRoutes.js";
// import patientRoutes from "./routes/patientRoutes.js";
// import appointmentRoutes from "./routes/appointmentRoutes.js";
// import prescriptionRoutes from "./routes/prescriptionRoutes.js";
// import hospitalRoutes from "./routes/hospitalRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js";

// import dns from "dns";

// dns.setServers(["1.1.1.1", "8.8.8.8"]);

// dotenv.config();

// const app = express();

// app.use(express.json());

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   }),
// );
// console.log("MONGO_URI:", process.env.MONGO_URI);
// connectDb();

// app.get("/", (req, res) => {
//   res.send("HMS Backend Running ");
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/doctors", doctorRoutes);
// app.use("/api/patient", patientRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/prescriptions", prescriptionRoutes);
// app.use("/api/hospitals", hospitalRoutes);
// app.use("/api/admin", adminRoutes);

// app.use("/api/ai", aiRoutes);




// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


















import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDb from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();



app.use(helmet());



app.use(express.json());



app.use(
  cors({
    origin: [
      "https://hms-app-l8ub.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);



app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
  }
  next();
});



connectDb();



app.get("/", (req, res) => {
  res.send("✅ HMS Backend Running Securely");
});



app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});


app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});