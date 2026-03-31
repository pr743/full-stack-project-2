import Patient from "../models/Patient.js";
import User from "../models/User.js";

export const saveHospital = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const hospitalId = req.params.id;

    if (!user.savedHospitals.includes(hospitalId)) {
      user.savedHospitals.push(hospitalId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Hospital saved successfully",
    });
  } catch (error) {
    console.error("SAVE HOSPITAL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





export const getSavedHospital = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("savedHospitals");


    res.status(200).json({
      success: true,
      data: user.savedHospitals,
    });

  } catch (error) {
    console.error("GET SAVED ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
}

export const removeSavedHospital = async (req, res) => {
  try {
    const hospitalId = req.params.id;

    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      {
        $pull: { savedHospitals: hospitalId },
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      message: "Hospital removed successfully",
    });

  } catch (error) {
    console.error("REMOVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing hospital",
    });
  }
};