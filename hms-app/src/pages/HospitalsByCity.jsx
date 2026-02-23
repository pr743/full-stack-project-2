import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchHospitalsByCity } from "../api/hospitalApi";
import HospitalCard from "../components/HospitalCard";
import { Search, MapPin, RotateCcw } from "lucide-react";
import Navbar from "../components/Navbar";

function HospitalsByCity() {
  const { user } = useContext(AuthContext);

  const [city, setCity] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const handleSearch = async () => {
    if (!city.trim()) {
      setAlert("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      setAlert("");

      const res = await fetchHospitalsByCity(city.trim());
      const hospitalList = res?.data?.data || [];

      setHospitals(hospitalList);

      if (hospitalList.length === 0) {
        setAlert("No hospitals found in this city");
      }
    } catch {
      setHospitals([]);
      setAlert("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCity("");
    setHospitals([]);
    setAlert("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">

          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800">
              Find Hospitals Near You
            </h1>
            <p className="text-gray-500 mt-2">
              Search hospitals by city and book appointments easily
            </p>
          </div>

          
          {user?.role === "admin" && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl text-center mb-6">
              Admin users cannot search hospitals.
            </div>
          )}

          
          {user?.role !== "admin" && (
            <div className="bg-white shadow-lg rounded-2xl p-5 flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-2 flex-1 bg-gray-100 px-4 py-3 rounded-xl">
                <MapPin className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter city (e.g. Rajkot)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent outline-none w-full"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl font-semibold transition"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          )}

          
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 shadow animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          
          {!loading && alert && (
            <div className="bg-white shadow-md rounded-xl p-6 text-center text-gray-600">
              {alert}
            </div>
          )}

          {!loading && hospitals.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital._id}
                  hospital={hospital}
                  userRole={user?.role}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HospitalsByCity;






















