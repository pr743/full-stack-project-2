import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import HospitalCard from "../components/HospitalCard";

function MySavedHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await API.get("/hospitals/saved");
        setHospitals(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-3xl font-bold mb-8">
            My Saved Hospitals
          </h1>

          {loading && (
            <p className="text-gray-500">Loading saved hospitals...</p>
          )}

          {!loading && hospitals.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-600">
                You have not saved any hospitals yet.
              </p>
            </div>
          )}

          {!loading && hospitals.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital._id}
                  hospital={hospital}
                  userRole="patient"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MySavedHospitals;