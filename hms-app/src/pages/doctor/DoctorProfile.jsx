import React from "react";
import { useState } from "react";
import API from "../../api/axios";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";

function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/doctor/profile");
      setProfile(res.data.data);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!profile)
    return <div className="p-6 text-red-500">Profile not found</div>;

  return (
    <>
      <Navbar />
      <div className="p-6 bg-gray-200 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Doctor Profile</h1>

          <p>
            <strong>Name:</strong> {profile.user?.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.user?.email}
          </p>
          <p>
            <strong>Specialization:</strong> {profile.specialization}
          </p>
          <p>
            <strong>Qualification:</strong> {profile.qualification}
          </p>
          <p>
            <strong>Experience:</strong> {profile.experience} years
          </p>
          <p>
            <strong>Consultation Fee:</strong> ₹{profile.consultationFee}
          </p>
          <p>
            <strong>Daily Limit:</strong> {profile.dailyLimit}
          </p>
          <p>
            <strong>Hospital:</strong> {profile.hospital?.name}
          </p>
        </div>
      </div>
    </>
  );
}

export default DoctorProfile;
