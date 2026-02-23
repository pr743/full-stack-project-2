import { useState } from "react";
import { Hospital } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

function AddHospital() {
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await API.post("/hospitals", {
        ...form,
      });

      setMessage(res.data.message || "Hospital saved successfully ✅");
      setLoading(true);
    } catch {
      alert("Failed to save hospital ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Hospital className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Add New Hospital / update existing one
              </h1>
            </div>
          </div>

          <div className="space-y-5">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Hospital Name"
              className="input"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="input"
                required
              />
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Area"
                className="input"
                required
              />
            </div>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Hospital Address"
              className="input"
              rows={3}
              required
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Saving..." : "Save Hospital"}
            </button>

            {message && (
              <p className="text-center text-green-600 font-medium mt-4">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddHospital;
