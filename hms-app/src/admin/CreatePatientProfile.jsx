import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useState } from "react";

function CreatePatientProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    gender: "",
    bloodGroup: "",
    hospitalId: "",
  });

  const message = location.state?.info;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/patient/profile", form);
      navigate("/patient/dashboard", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
             {message}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="age" placeholder="Age" onChange={handleChange} required />
          <input name="gender" placeholder="Gender" onChange={handleChange} required />
          <input name="bloodGroup" placeholder="Blood Group" onChange={handleChange} />
          <input name="hospitalId" placeholder="Hospital ID" onChange={handleChange} required />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePatientProfile;
