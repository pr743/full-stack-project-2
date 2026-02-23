import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/patient/dashboard");
        setStats(res.data.data);
      } catch (err) {

        const message = err.response?.data?.message;


        if(message  === "Patient profile not found"){
          navigate("/patient/create-profile",{
            replace:true,
            state:{
              info: "Please complete your profile to access the dashboard",
            },
          });
        }else{
          console.error("Dashboard error:", err);
        }
        
  
        console.error(err.response?.data || err.message);

        console.error("Patient dashboard load failed");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-xl">Loading dashboard...</div>
      </>
    );
  }



  if (!stats) return null;

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-xl text-red-500">
          Failed to load patient dashboard data
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Patient Dashboard
        </h1>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon={<CalendarCheck size={28} />}
            color="blue"
          />

          <StatCard
            title="Upcoming Appointments"
            value={stats.upcomingAppointments}
            icon={<CalendarClock size={28} />}
            color="orange"
          />

          <StatCard
            title="Completed Appointments"
            value={stats.completedAppointments}
            icon={<CheckCircle size={28} />}
            color="green"
          />

          <StatCard
            title="Prescriptions"
            value={stats.totalPrescriptions}
            icon={<FileText size={28} />}
            color="purple"
          />
        </div>

        
        <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Patient Overview</h2>
          <p className="text-gray-600">
            Manage your appointments and view prescriptions easily.  
            All information is securely fetched from the hospital system.
          </p>
        </div>
      </div>
    </>
  );
}


function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
      <div>
        <p className="text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      </div>
      <div className={`p-4 rounded-full ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

export default PatientDashboard;
