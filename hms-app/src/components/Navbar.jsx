import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { LogOut, User, Hospital, Menu, X } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    window.location.href = "/login";
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 w-full bg-blue-600 text-white shadow-md z-50">
      <div className="flex items-center justify-between px-6 py-3">
        
        
        <div className="flex items-center gap-2">
          <Hospital size={28} />
          <span className="text-xl font-bold">HMS</span>
        </div>

        
        <div className="hidden md:flex items-center gap-6 font-medium">
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Patient Register</Link>
              <Link to="/admin/register">Admin Register</Link>
            </>
          )}

          {user?.role === "patient" && (
            <>
              <Link to="/patient">Dashboard</Link>
              <Link to="/patient/appointment"> Book Appointment </Link>
              <Link to="/hospitals">Find Hospital</Link>
              <Link to="/saved-hospitals">Saved</Link>
              <Link to="/patient/prescriptions"> Prescriptions </Link>
              <Link to="/patient/history">History</Link>
            </>
          )}

          {user?.role === "doctor" && (
            <>
              <Link to="/doctor">Dashboard</Link>
              <Link to="/doctor/appointments">My Appointments</Link>
              <Link to="/doctor/create-prescription">Create Prescription</Link>
              <Link to="/doctor/prescriptions">View Prescription</Link>
              <Link to="/doctor/profile">Profile</Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/hospitals">Add Hospital</Link>
              <Link to="/admin/doctors">Doctors</Link>
              <Link to="/admin/patients">Patients</Link>
              <Link to="/admin/appointments">Appointments</Link>
              <Link to="/admin/add-doctor">Add Doctor</Link>
            </>
          )}
        </div>

        
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 bg-blue-500 px-3 py-1 rounded-lg">
              <User size={18} />
              <span className="capitalize">
                {user.name} ({user.role})
              </span>
            </div>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}

          
          <button onClick={() => setIsOpen(true)} className="md:hidden">
            <Menu size={26} />
          </button>
        </div>
      </div>

      
      {isOpen && (
        <>
          
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          ></div>

          
          <div className="fixed top-0 left-0 h-full w-72 bg-white text-black z-50 shadow-lg transition-transform duration-300">
            
            
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-blue-600">Menu</h2>
              <X
                size={24}
                className="cursor-pointer"
                onClick={closeMenu}
              />
            </div>

            
            <div className="flex flex-col p-4 space-y-4">

              {!user && (
                <>
                  <Link to="/login" onClick={closeMenu}>Login</Link>
                  <Link to="/register" onClick={closeMenu}>Patient Register</Link>
                  <Link to="/admin/register" onClick={closeMenu}>Admin Register</Link>
                  <Link to="/hospitals" onClick={closeMenu}>Find Hospital</Link>
                </>
              )}

              {user?.role === "patient" && (
                <>
                  <Link to="/patient" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/patient/appointment" onClick={closeMenu}> Book Appointment </Link>
                  <Link to="/hospitals" onClick={closeMenu}>Find Hospital</Link>
                  <Link to="/saved-hospitals" onClick={closeMenu}>Saved Hospitals</Link>
                  <Link to="/patient/prescriptions" onClick={closeMenu}> Prescriptions </Link>
                  <Link to="/patient/history" onClick={closeMenu}>History</Link>
                </>
              )}

              {user?.role === "doctor" && (
                <>
                  <Link to="/doctor" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/doctor/appointments" onClick={closeMenu}>My Appointments</Link>
                  <Link to="/doctor/create-prescription" onClick={closeMenu}>Create Prescription</Link>
                  <Link to="/doctor/prescriptions" onClick={closeMenu}>View Prescription</Link>
                  <Link to="/doctor/profile" onClick={closeMenu}>Profile</Link>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <Link to="/admin" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/admin/hospitals" onClick={closeMenu}>Add Hospital</Link>
                  <Link to="/admin/doctors" onClick={closeMenu}>Doctors</Link>
                  <Link to="/admin/patients" onClick={closeMenu}>Patients</Link>
                  <Link to="/admin/appointments" onClick={closeMenu}>Appointments</Link>
                  <Link to="/admin/add-doctor" onClick={closeMenu}>Add Doctor</Link>
                </>
              )}

             
              {user && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-3 bg-blue-100 px-3 py-2 rounded">
                    <User size={18} />
                    <span className="capitalize">
                      {user.name} ({user.role})
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;