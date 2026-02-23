import React, { useContext, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { Lock, Mail, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => {
      setAlert(null);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "patient",
      });

     
      login(res.data);

      localStorage.setItem("email", form.email.trim());

      showAlert("Register Successfully ✅");

      
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      showAlert(
        err.response?.data?.message || "Register Failed ❌",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 to-blue-200 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              Patient Register
            </h1>
          </div>

          {alert && (
            <div
              className={`fixed top-4 left-1/2 -translate-x-1/2 
              px-4 py-2 rounded-xl text-black font-semibold z-50
              ${
                alert.type === "error"
                  ? "bg-red-400"
                  : "bg-green-400"
              }`}
            >
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="text-black">
            
            <div className="mb-5">
              <label className="mb-2 block">Name</label>
              <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                <User size={20} className="text-gray-400" />
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="bg-transparent outline-none w-full px-3"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            
            <div className="mb-5">
              <label className="mb-2 block">Email</label>
              <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                <Mail size={20} className="text-gray-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  className="bg-transparent outline-none w-full px-3"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            
            <div className="mb-6">
              <label className="mb-2 block">Password</label>
              <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full px-3"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {loading && <Loader />}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-70 text-white"
            >
              Sign Up
            </button>

            <p className="text-sm text-center mt-5">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-700"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;