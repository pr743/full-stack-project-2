import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function DoctorAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/doctor");
      setAppointments(res.data.data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const markCompleted = async (id) => {
    try {
      await API.patch(`/appointments/doctor/${id}/status`, {
        status: "completed",
      });

      fetchAppointments();
    } catch (error) {
      console.error("Failed to mark completed:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-lg">Loading appointments...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          My Appointments
        </h1>

        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className={`bg-white p-4 md:p-6 rounded-xl shadow-md
              ${
                appt.appointmentType === "emergency"
                  ? "border-l-8 border-red-500"
                  : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-lg">
                    <User size={18} />
                    {appt?.patient?.user?.name ?? "N/A"}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {appt?.appointmentDate
                        ? new Date(appt.appointmentDate).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {appt?.slotTime ?? "N/A"}
                    </div>
                  </div>

                  {appt.appointmentType === "emergency" && (
                    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                      <AlertTriangle size={16} /> EMERGENCY
                    </div>
                  )}

                  <p className="text-gray-600 text-sm">
                    <strong>Reason:</strong> {appt?.reason ?? "N/A"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {appt.status === "booked" ? (
                    <button
                      onClick={() => markCompleted(appt._id)}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      <CheckCircle size={16} /> Complete
                    </button>
                  ) : (
                    <span className="text-green-600 font-semibold text-sm text-center">
                      Completed
                    </span>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/doctor/patient/${appt.patient._id}/history`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No appointments found
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DoctorAppointment;