import { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function PatientHistory() {
  const [records, setRecords] = useState([]);

  const fetchHistory = async () => {
    try {
    const res = await API.get("/prescriptions/history");
      setRecords(res.data.data);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchHistory();
}, []);


  return (

    <>
    <Navbar/>

    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Patient Medical History</h2>

      {records.length === 0 ? (
  <div>No history found</div>
) : (
  records.map((record) => (
    <div
      key={record._id}
      className="bg-white shadow-md p-6 mb-6 rounded-lg border-l-4 border-blue-500"
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-gray-800">
          {record.doctor?.user?.name}
        </h3>
        <span className="text-sm text-gray-500">
          {new Date(record.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-700">
        <strong>Diagnosis:</strong> {record.diagnosis}
      </p>

      {record.notes && (
        <p className="text-gray-600 mt-2">
          <strong>Doctor Notes:</strong> {record.notes}
        </p>
      )}

      <div className="mt-3 text-sm text-gray-500">
        Appointment Status: {record.appointment?.status}
      </div>
    </div>
  ))
)}
    </div>
    </>
  );
}