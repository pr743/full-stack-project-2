import { useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function CreatePrescription() {
  const [appointmentId, setAppointmentId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", duration: "", instructions: "" },
  ]);

  const handleMedicineChange = (index, e) => {
    const values = [...medicines];
    values[index][e.target.name] = e.target.value;
    setMedicines(values);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", duration: "", instructions: "" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/prescriptions", {
        appointmentId,
        diagnosis,
        notes,
        medicines,
      });

      alert("Prescription Created Successfully");
      setAppointmentId("");
      setDiagnosis("");
      setNotes("");
      setMedicines([{ name: "", dosage: "", duration: "", instructions: "" }]);
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert("Error creating prescription");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create Prescription</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Appointment ID"
          className="w-full border p-2 rounded"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
          required
        />

        <textarea
          placeholder="Diagnosis"
          className="w-full border p-2 rounded"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />

        <textarea
          placeholder="Notes"
          className="w-full border p-2 rounded"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <h3 className="text-lg font-semibold">Medicines</h3>

        {medicines.map((med, index) => (
          <div key={index} className="grid grid-cols-2 gap-3 border p-3 rounded">
            <input
              name="name"
              placeholder="Medicine Name"
              className="border p-2 rounded"
              value={med.name}
              onChange={(e) => handleMedicineChange(index, e)}
              required
            />
            <input
              name="dosage"
              placeholder="Dosage"
              className="border p-2 rounded"
              value={med.dosage}
              onChange={(e) => handleMedicineChange(index, e)}
              required
            />
            <input
              name="duration"
              placeholder="Duration"
              className="border p-2 rounded"
              value={med.duration}
              onChange={(e) => handleMedicineChange(index, e)}
              required
            />
            <input
              name="instructions"
              placeholder="Instructions"
              className="border p-2 rounded"
              value={med.instructions}
              onChange={(e) => handleMedicineChange(index, e)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicine}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add Medicine
        </button>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Submit Prescription
        </button>
      </form>
    </div>

    </>
  );
}
