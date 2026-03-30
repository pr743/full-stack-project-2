import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import PDFDocument from "pdfkit";

export const createPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const { appointmentId, medicines, diagnosis, notes, signature } = req.body;

    if (!appointmentId || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Appointment and medicines required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }


    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized doctor",
      });
    }


    if (appointment.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress appointments allowed",
      });
    }


    const existing = await Prescription.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Prescription already exists",
      });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: doctor._id,
      patient: appointment.patient,
      hospital: appointment.hospital,
      medicines,
      diagnosis,
      notes,
      signature: signature || "",
    });


    appointment.status = "completed";
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Prescription created & appointment completed",
      data: prescription,
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
    });
  }
};




export const getDoctorTodayAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: today },
      status: "completed",
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name" },
      })
      .sort({ appointmentDate: 1 });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
};





export const getDoctorPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    const prescriptions = await Prescription.find({
      doctor: doctor._id,
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load prescriptions",
    });
  }
};



export const getPatientPrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    const prescriptions = await Prescription.find({
      patient: patient._id,
    })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load prescriptions",
    });
  }
};


export const getPatientHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const history = await Prescription.find({ patient: patient._id })

      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" },
      })
      .populate("appointment", "date status")
      .select("diagnosis notes createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load patient history",
    });
  }
};



export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      })
    }

    await Prescription.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getDoctorAppointmentsForPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
      status: "in-progress",
    })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .select("appointmentDate slotTime patient status")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};





export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" },
      })
      .populate("hospital");

    if (!prescription) {
      return res.status(404).json({ message: "Not found" });
    }

    const doc = new PDFDocument({ margin: 40 });


    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription-${prescription._id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);


    doc
      .fontSize(20)
      .text(prescription.hospital?.name || "Hospital Name", {
        align: "center",
      });

    doc
      .fontSize(10)
      .text("Address: Gujarat, India Rajkot", { align: "center" });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();


    doc.moveDown();

    doc.fontSize(12).text(`Doctor: ${prescription.doctor?.user?.name || "-"}`);
    doc.text(`Patient: ${prescription.patient?.user?.name || "-"}`);
    doc.text(
      `Date: ${new Date(prescription.createdAt).toLocaleDateString()}`
    );

    doc.moveDown();


    doc.fontSize(14).text("Diagnosis:", { underline: true });
    doc.fontSize(12).text(prescription.diagnosis || "-");

    doc.moveDown();


    doc.fontSize(14).text("Medicines:", { underline: true });
    doc.moveDown(0.5);

    if (prescription.medicines.length === 0) {
      doc.text("No medicines");
    } else {
      prescription.medicines.forEach((med, index) => {
        doc.text(
          `${index + 1}. ${med.name} | ${med.dosage} | ${med.duration}`
        );
      });
    }

    doc.moveDown();


    if (prescription.notes) {
      doc.fontSize(14).text("Notes:", { underline: true });
      doc.fontSize(12).text(prescription.notes);
    }

    doc.moveDown(2);


    if (prescription.signature) {
      try {
        const base64Data = prescription.signature.replace(
          /^data:image\/png;base64,/,
          ""
        );

        const imgBuffer = Buffer.from(base64Data, "base64");

        doc.image(imgBuffer, {
          fit: [150, 80],
          align: "right",
        });

        doc.text("Doctor Signature", { align: "right" });
      } catch (err) {
        console.log("Signature error:", err);
        doc.text("Signature not available", { align: "right" });
      }
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF Error" });
  }
};


















