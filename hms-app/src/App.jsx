import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import { useContext } from "react";
import AdminDashboard from "./admin/AdminDashboard";
import { AuthContext } from "./context/AuthContext";
import Doctor from "./admin/Doctor";
import Patients from "./admin/Patients";
import Appointments from "./admin/Appointments";
import DoctorDashboard from "./admin/DoctorDashboard";
import PatientDashboard from "./admin/PatientDashboard";
import AddDoctor from "./admin/AddDoctor";
import BookAppointment from "./pages/patients/BookAppointment";
import DoctorAppointment from "./pages/doctor/DoctorAppointment";
import AdminRegister from "./Auth/AdminRegister";
import HospitalsByCity from "./pages/HospitalsByCity";
import AddHospital from "./admin/AddHospital";
import CreatePatientProfile from "./admin/CreatePatientProfile";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorPatientHistory from "./pages/doctor/DoctorPatientHistory";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import CreatePrescription from "./pages/doctor/CreatePrescription";
import PatientPrescriptions from "./pages/patients/PatientPrescriptions";
import PatientHistory from "./pages/patients/PatientHistory";
import MySavedHospitals from "./pages/MySavedHospitals";
function App() {
  const { user } = useContext(AuthContext);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        <Route path="/hospitals" element={<HospitalsByCity />} />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/doctors"
          element={
            user?.role === "admin" ? <Doctor /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin/patients"
          element={
            user?.role === "admin" ? <Patients /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin/appointments"
          element={
            user?.role === "admin" ? <Appointments /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin/add-doctor"
          element={
            user?.role === "admin" ? <AddDoctor /> : <Navigate to="/login" />
          }
        />


        <Route
          path="/admin/hospitals"
          element={
            user?.role === "admin" ? <AddHospital /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/doctor"
          element={
            user?.role === "doctor" ? (
              <DoctorDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/patient"
          element={
            user?.role === "patient" ? (
              <PatientDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/patient/create-profile"
          element={
            user?.role === "patient" ? (
              <CreatePatientProfile />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/patient/appointment"
          element={
            user?.role === "patient" ? (
              <BookAppointment />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/patient/prescriptions"
          element={
            user?.role === "patient" ? (
              <PatientPrescriptions />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/patient/history"
          element={
            user?.role === "patient" ? (
              <PatientHistory />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/saved-hospitals"
          element={
            user?.role === "patient" ? (
              <MySavedHospitals />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/doctor/appointments"
          element={
            user?.role === "doctor" ? (
              <DoctorAppointment />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/doctor/profile"
          element={
            user?.role === "doctor" ? (
              <DoctorProfile/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/doctor/patient/:patientId/history"
          element={
            user?.role === "doctor" ? (
              <DoctorPatientHistory/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/doctor/prescriptions"
          element={
            user?.role === "doctor" ? (
              <DoctorPrescriptions/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/doctor/create-prescription"
          element={
            user?.role === "doctor" ? (
              <CreatePrescription/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />



        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
