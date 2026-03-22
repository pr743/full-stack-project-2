import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  CalendarDays,
  ClipboardList,
  CheckCircle,
  Users,
} from "lucide-react";

function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/doctors/dashboard");
        setStats(res.data.data);
      } catch {
        console.error("Doctor dashboard load failed");
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

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-xl text-red-500">
          Failed to load doctor dashboard data
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Doctor Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointment}
            icon={<CalendarDays size={28} />}
            color="blue"
          />

          <StatCard
            title="Pending Appointments"
            value={stats.pendingAppointment}
            icon={<ClipboardList size={28} />}
            color="orange"
          />

          <StatCard
            title="Completed Appointments"
            value={stats.completedAppointment}
            icon={<CheckCircle size={28} />}
            color="green"
          />

          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<Users size={28} />}
            color="purple"
          />
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

export default DoctorDashboard;8
