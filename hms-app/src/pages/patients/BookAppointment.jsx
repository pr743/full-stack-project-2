import React, { useEffect, useState } from "react";
import { Calendar, Clock, User, FileText } from "lucide-react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";

function BookAppointment() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    hospitalId: "",
    doctorId: "",
    appointmentDate: "",
    slotTime: "",
    reason: "",
    appointmentType: "normal",
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await API.get("/patient/hospitals");
        setHospitals(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Failed to load hospitals", err);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!form.hospitalId) {
      setDoctors([]);
      return;
    }

    const fetchDoctors = async () => {
      try {
        const res = await API.get(
          `/patient/hospitals/${form.hospitalId}/doctors`,
        );

        const docs = Array.isArray(res.data.data) ? res.data.data : [];
        setDoctors(docs);

        setForm((prev) => ({ ...prev, doctorId: "" }));
      } catch (err) {
        console.error("Failed to load doctors", err);
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [form.hospitalId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.doctorId) {
      setMessage("Please select a doctor");
      return;
    }

    if (!form.appointmentDate) {
      setMessage("Please select appointment date");
      return;
    }

    if (form.appointmentType === "normal" && !form.slotTime) {
      setMessage("Please select time slot");
      return;
    }

    if (!form.reason.trim()) {
      setMessage("Please enter reason");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/patient/appointment", form);

      console.log("ApI response", res.data);

      // setResult({
      //   token: res.data.token || 0,
      //   queueNumber: res.data.queueNumber || 0,
      //   waitTime: res.data.waitTime || 0,
      // });

      setResult({
        queueNumber: res.data.data.queueNumber,
        waitTime: res.data.data.estimatedWaitTime,
        type: res.data.data.appointmentType,
      });
      setMessage("Appointment booked successfully ✅");

      setForm({
        hospitalId: "",
        doctorId: "",
        appointmentDate: "",
        slotTime: "",
        reason: "",
        appointmentType: "normal",
      });

      setDoctors([]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed ❌");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
        <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Book Appointment
          </h1>

          {message && (
            <p className="mb-4 text-center font-semibold text-blue-600">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Appointment Type</label>
              <select
                name="appointmentType"
                value={form.appointmentType}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded-lg outline-none"
                required
              >
                <option value="normal">Normal</option>
                <option value="emergency">Emergency (24×7)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Hospital</label>
              <div className="flex items-center bg-gray-100 rounded-lg px-3">
                <User className="text-gray-400 mr-2" size={18} />
                <select
                  name="hospitalId"
                  value={form.hospitalId}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 outline-none"
                  required
                >
                  <option value="" disabled>
                    Select hospital
                  </option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Doctor</label>
              <div className="flex items-center bg-gray-100 rounded-lg px-3">
                <User className="text-gray-400 mr-2" size={18} />
                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 outline-none"
                  required
                >
                  <option value="" disabled>
                    {doctors.length === 0
                      ? "No doctors available"
                      : "Select Doctor"}
                  </option>

                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.user?.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {form.hospitalId && doctors.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  No doctors available for this hospital
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Date</label>
              <div className="flex items-center bg-gray-100 rounded-lg px-3">
                <Calendar className="text-gray-400 mr-2" size={18} />
                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 outline-none"
                  required
                />
              </div>
            </div>

            {form.appointmentType === "normal" && (
              <div>
                <label className="block mb-1 font-medium">Time Slot</label>
                <div className="flex items-center bg-gray-100 rounded-lg px-3">
                  <Clock className="text-gray-400 mr-2" size={18} />
                  <select
                    name="slotTime"
                    value={form.slotTime}
                    onChange={handleChange}
                    className="w-full bg-transparent p-3 outline-none"
                    required={form.appointmentType === "normal"}
                  >
                    <option value="" disabled>
                      Select Time
                    </option>
                    {[
                      "10:00 AM",
                      "11:00 AM",
                      "12:00 PM",
                      "2:00 PM",
                      "3:00 PM",
                      "4:00 PM",
                      "5:00 PM",
                      "6:00 PM",
                      "7:00 PM",
                      "8:00 PM",
                      "9:00 PM",
                    ].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {form.appointmentType === "emergency" && (
              <p className="text-red-500 font-semibold">
                Emergency appointments are available 24×7 and given priority.
              </p>
            )}

            <div>
              <label className="block mb-1 font-medium">Reason</label>
              <div className="flex items-start bg-gray-100 rounded-lg px-3">
                <FileText className="text-gray-400 mr-2 mt-3" size={18} />
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 outline-none resize-none"
                  rows="3"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>

            {result && (
              <div className="mt-6 bg-green-50 border rounded-2xl p-4">
                <h2 className="font-bold text-green-700 text-lg mb-2">
                  ✅ Appointment Confirmed
                </h2>

                {result.type === "emergency" ? (
                  <p className="text-red-600 font-bold">
                    🚨 Emergency - Immediate Attention
                  </p>
                ) : (
                  <>
                    <p>
                      📍 Queue Position: <b>{result.queueNumber}</b>
                    </p>

                    <p>
                      ⏳ Estimated Wait Time: <b>{result.waitTime} mins</b>
                    </p>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default BookAppointment;
