import Hospital from "../models/Hospital.js";
import User from "../models/User.js";


export const getHospitalByCity = async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    const hospitals = await Hospital.find({
      city: { $regex: `^${city.trim()}`, $options: "i" },
      isActive: true,
    }).select("name city area address");

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const addHospital = async (req, res) => {
//   try {
//     const { name, city, address } = req.body;


//     if (!name || !city) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and city are required",
//       })
//     }


//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Admins only",
//       });
//     }


//     let hospital = await Hospital.findOne({ admin: req.user._id });




//     let slotDuration = 15;

//     if (city.toLowerCase().includes("village")) {
//       slotDuration = 20;

//     }

//     if (hospital) {
//       hospital.name = name;
//       hospital.city = city.trim().toLowerCase();
//       hospital.address = address;

//       await hospital.save();

//       await User.findByIdAndUpdate(req.user._id, {
//         hospitalId: hospital._id,
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Hospital updated successfully",
//         hospital,
//       });
//     }

//     hospital = await Hospital.create({
//       name,
//       city: city.trim().toLowerCase(),
//       address,
//       admin: req.user._id,
//       isActive: true,
//     });



//     await User.findByIdAndUpdate(req.user._id, {
//       hospitalId: hospital._id,
//     });



//     res.status(201).json({
//       success: true,
//       message: "Hospital created successfully",
//       hospital,
//     });
//   } catch (error) {
//     console.error("ADD HOSPITAL ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to save hospital",
//     });

//   }
// };


export const addHospital = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      startTime,
      endTime,
      slotDuration,
      emergencyEnabled,
    } = req.body;


    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: "Name and city are required",
      });
    }


    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }


    let hospital = await Hospital.findOne({ admin: req.user._id });


    let finalSlot = slotDuration || 15;
    let finalStart = startTime || "09:00";
    let finalEnd = endTime || "21:00";
    let finalEmergency = emergencyEnabled ?? true;

    if (!slotDuration) {
      if (city.toLowerCase().includes("village")) {
        finalSlot = 20;
      } else if (city.toLowerCase().includes("metro")) {
        finalSlot = 10;
      } else {
        finalSlot = 15;
      }
    }


    if (hospital) {
      hospital.name = name;
      hospital.city = city.trim().toLowerCase();
      hospital.address = address;


      hospital.startTime = finalStart;
      hospital.endTime = finalEnd;
      hospital.slotDuration = finalSlot;
      hospital.emergencyEnabled = finalEmergency;

      await hospital.save();

      await User.findByIdAndUpdate(req.user._id, {
        hospitalId: hospital._id,
      });

      return res.status(200).json({
        success: true,
        message: "Hospital updated successfully",
        hospital,
      });
    }


    hospital = await Hospital.create({
      name,
      city: city.trim().toLowerCase(),
      address,
      admin: req.user._id,


      startTime: finalStart,
      endTime: finalEnd,
      slotDuration: finalSlot,
      emergencyEnabled: finalEmergency,

      isActive: true,
    });


    await User.findByIdAndUpdate(req.user._id, {
      hospitalId: hospital._id,
    });



    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital,
    });

  } catch (error) {
    console.error("ADD HOSPITAL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save hospital",
    });
  }
};