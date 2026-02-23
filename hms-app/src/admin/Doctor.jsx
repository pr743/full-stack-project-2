
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { UserCheck, UserX } from "lucide-react";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/admin/doctors");
      setDoctors(res.data.data);
    } catch {
      console.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const toggleStatus = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/toggle`);
      fetchDoctors();
    } catch {
      console.error("Failed to update status");
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Doctors Management
        </h1>

        {loading ? (
          <p>Loading doctors...</p>
        ) : (
          <>
           
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Specialization</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {doc.user?.name}
                      </td>
                      <td className="px-6 py-4">{doc.user?.email}</td>
                      <td className="px-6 py-4">
                        {doc.specialization || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            doc.user?.isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {doc.user?.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(doc.user._id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${
                            doc.user?.isActive
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {doc.user?.isActive ? (
                            <>
                              <UserX size={16} /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck size={16} /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {doctors.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-6 text-gray-500"
                      >
                        No doctors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            
            <div className="md:hidden space-y-4">
              {doctors.length === 0 && (
                <div className="text-center text-gray-500">
                  No doctors found
                </div>
              )}

              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-xl shadow p-4 space-y-3"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      {doc.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doc.user?.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        Specialization:
                      </span>{" "}
                      {doc.specialization || "—"}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.user?.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {doc.user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleStatus(doc.user._id)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${
                      doc.user?.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {doc.user?.isActive ? (
                      <>
                        <UserX size={16} /> Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} /> Activate
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Doctors;