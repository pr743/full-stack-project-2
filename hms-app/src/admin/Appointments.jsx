import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  CalendarDays,
  User,
  Stethoscope,
  Clock,
  XCircle,
} from "lucide-react";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/admin");
      setAppointments(res.data.data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await API.patch(`/appointments/${id}/cancel`);

      fetchAppointments();
    } catch{
      console.error("Failed to cancel appointment");
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Appointments Monitoring
        </h1>

        {loading ? (
          <p className="text-lg">Loading appointments...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
               
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      appt.status === "booked"
                        ? "bg-blue-100 text-blue-600"
                        : appt.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {appt.status}
                  </span>

                  {appt.status === "booked" && (
                    <button
                      onClick={() => cancelAppointment(appt._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle size={22} />
                    </button>
                  )}
                </div>

                
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-blue-500" />
                  <span className="font-medium">
                    {appt.patient?.user?.name || "N/A"}
                  </span>
                </div>

               
                <div className="flex items-center gap-3 mb-2">
                  <Stethoscope className="text-green-500" />
                  <span className="font-medium">
                    {appt.doctor?.user?.name || "N/A"}

                  </span>
                </div>

                
                <div className="flex items-center gap-3 mb-2 text-gray-600">
                  <CalendarDays size={18} />
                  <span>{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                </div>

               
                <div className="flex items-center gap-3 mb-4 text-gray-600">
                  <Clock size={18} />
                  <span>{appt.slotTime}</span>
                </div>

               
                <p className="text-gray-600 text-sm">
                  <strong>Reason:</strong> {appt.reason || "—"}
                </p>
              </div>
            ))}

            {appointments.length === 0 && (
              <p className="text-gray-500">No appointments found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Appointments;
