import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { User, Mail, ShieldCheck, ShieldOff } from "lucide-react";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await API.get("/admin/patients");
      setPatients(res.data.data);
    } catch {
      console.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const toggleStatus = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/toggle`);
      fetchPatients();
    } catch {
      console.error("Failed to update status");
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Patients Management
        </h1>

        {loading ? (
          <p className="text-lg">Loading patients...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" size={26} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {patient.user?.name || "N/A"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {patient.gender || "—"} | {patient.age || "—"} yrs
                    </p>
                  </div>
                </div>

               
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Mail size={18} />
                  <span className="text-sm">{patient.user?.email}</span>
                </div>

               
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      patient.user?.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {patient.user?.isActive ? "Active" : "Blocked"}
                  </span>

                  <button
                    onClick={() => toggleStatus(patient.user._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold
                    ${
                      patient.user?.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {patient.user?.isActive ? (
                      <>
                        <ShieldOff size={16} /> Block
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {patients.length === 0 && (
              <p className="text-gray-500">No patients found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Patients;
