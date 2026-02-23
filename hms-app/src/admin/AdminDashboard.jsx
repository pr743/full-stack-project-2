import React, { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import {
  Users,
  UserCheck,
  CalendarDays,
  Stethoscope,
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsHospitalSetup, setNeedsHospitalSetup] = useState(false);


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/admin/dashboard");

        
        if (res.data.needsHospitalSetup) {
          setNeedsHospitalSetup(true);
          setStats(null);
          return;
        }

        setStats(res.data.data);
      } catch (error) {
        console.error("Dashboard load failed", error);
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

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">

        
        {needsHospitalSetup && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome Admin 👋
              </h1>

              <p className="text-gray-600 mt-2">
                Let’s start by setting up your hospital
              </p>

              <Link
                to="/admin/add-hospital"
                className="inline-block mt-6 bg-blue-600 hover:bg-blue-700
                text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Add Hospital
              </Link>
            </div>
          </div>
        )}

        
        {!needsHospitalSetup && stats && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Admin Dashboard
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Doctors"
                value={stats.totalDoctors}
                icon={<Stethoscope size={30} />}
                color="blue"
              />

              <StatCard
                title="Active Doctors"
                value={stats.activeDoctors}
                icon={<UserCheck size={30} />}
                color="orange"
              />

              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={<Users size={30} />}
                color="green"
              />

              <StatCard
                title="Total Appointments"
                value={stats.totalAppointments}
                icon={<CalendarDays size={30} />}
                color="purple"
              />
            </div>

            <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-2">System Status</h2>
              <p className="text-gray-600">
                This dashboard shows real-time hospital data. All statistics
                update automatically from the backend.
              </p>
            </div>
          </>
        )}
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
        <h2 className="text-3xl font-bold text-gray-800">
          {value ?? 0}
        </h2>
      </div>
      <div className={`p-4 rounded-full ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

export default AdminDashboard;
