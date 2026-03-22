import React, { useContext, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { Lock, Mail} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      login(res.data);

      localStorage.setItem("token",res.data.token);


      localStorage.setItem("user",JSON.stringify(res.data.user));


      showAlert("login successfully","success");

      navigate(`/${res.data.user.role}`);

    } catch {
      showAlert("Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };
  return (
    <>
    <Navbar/>

   
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr  from-blue-500 to-blue-200 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">HMS Login</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hospital Management System
          </p>
        </div>

        {alert && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 
          px-4 py-2 rounded-xl text-black font-semibold z-50
          ${alert.type === "error" ? "bg-red-400" : "bg-green-400"}`}
          >
            {alert.type === "error" ? "⚠️" : "✅"} {alert.msg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white  text-black">
          <div className="mb-5">
            <label className="text-black mb-2 block">Email</label>
            <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
              <Mail size={20} className="text-gray-400" />
              <input
                name="email"
                type="email"
                placeholder="doctor@hms.com"
                className="bg-transparent outline-none w-full px-3"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-black mb-2 block">password</label>
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

          {loading ? <Loader /> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-70"
          >
            Login
          </button>

          <p className="text-black text-sm text-center mt-5">
            Don’t have an account?{" "}
            <Link
              to="/admin/register"
              className="text-blue-400 hover:text-blue-600"
            >
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
    </>
  );
}

export default Login;
