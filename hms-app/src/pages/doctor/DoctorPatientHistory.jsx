import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import { Calendar, Clock, User } from "lucide-react";
import { useParams } from "react-router-dom";

function DoctorPatientHistory() {
  const { patientId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(
          `/appointments/patient/${patientId}/history`
        );
        setHistory(res.data.data);
      } catch {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6">Loading history...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Patient History</h1>

        {history.length === 0 ? (
          <p className="text-gray-500">No history found</p>
        ) : (
          <div className="space-y-4">
            {history.map((appt) => (
              <div
                key={appt._id}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <User />
                  {appt.patient?.user?.name || "N/A"}
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar />
                  {appt?.appointmentDate
                    ? new Date(appt.appointmentDate).toLocaleDateString()
                    : "N/A"}
                  <Clock />
                  {appt?.slotTime || "N/A"}
                </div>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      appt.status === "completed"
                        ? "text-green-600"
                        : appt.status === "cancelled"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {appt.status}
                  </span>
                </p>

                <p>
                  <strong>Type:</strong> {appt.appointmentType}
                </p>

                <p>
                  <strong>Reason:</strong> {appt.reason || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DoctorPatientHistory;
