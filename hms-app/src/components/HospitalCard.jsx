import React from "react";
import { Hospital, MapPin, BookmarkPlus } from "lucide-react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function HospitalCard({ hospital, userRole }) {
  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);

  const handleSave = async () => {
  if (!userRole) {
    showAlert("Please login to save this hospital");
    return;
  }

  try {
    await API.post(`/hospitals/save/${hospital._id}`);
   showAlert("Hospital saved successfully");
  } catch (error) {
    console.error(error);
    showAlert("Failed to save hospital");
  }
};


const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 2000);
  };
  
  const handleBookAppointment = () => {
    navigate(`/patient/book?hospitalId=${hospital._id}`);
  };

  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white flex flex-col justify-between">


    {alert && (
            <div
              className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl font-semibold
              ${alert.type === "error" ? "bg-red-400" : "bg-green-400"}`}
            >
              {alert.type === "error" ? "⚠️" : "✅"} {alert.msg}
            </div>
          )}
      
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
          <Hospital size={18} />
          {hospital.name}
        </h2>

        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
          <MapPin size={14} />
          {hospital.area || "Area not available"}, {hospital.city}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          {hospital.address || "Address not available"}
        </p>
      </div>

      
      <div className="mt-4 flex flex-col gap-2">
       
        {userRole && (
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition"
          >
            <BookmarkPlus size={16} />
            Save Hospital
          </button>
        )}

        
        {userRole === "patient" && (
          <button
            onClick={handleBookAppointment}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Book Appointment
          </button>
        )}
      </div>
    </div>
  );
}

export default HospitalCard;
