import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;   // prevent double requests

  setLoading(true);

  try {
    const res = await login(form);

    toast.success("Login successful!", {
      autoClose: 3000
    });

    navigate("/dashboard");

  } catch (err) {

    const message =
      err.response?.data?.message ||
      "Invalid email or password";

    toast.error(message);

  } finally {
    setLoading(false);
  }
};;


  return (
    <div className="min-h-screen flex items-center justify-center 
    bg-linear-to-br from-indigo-500 via-purple-500 to-blue-500 p-6">

      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl 
      p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-gray-800">
            🎯 InterviewPrep
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome back! Login to continue
          </p>

        </div>

       

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500 transition"
            />
          </div>


          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500 transition"
            />
          </div>


          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg 
            font-semibold hover:bg-indigo-700 transition
            shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        {/* Register */}
        <p className="text-sm text-center mt-6 text-gray-600">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
};

export default LoginPage;