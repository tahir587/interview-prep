import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Flipkart",
  "Infosys",
  "TCS",
  "Wipro",
];

const RegisterPage = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    targetCompanies: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleCompany = (company) => {

    setForm((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.includes(company)
        ? prev.targetCompanies.filter((c) => c !== company)
        : [...prev.targetCompanies, company],
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await register(form);

      navigate("/dashboard");

    } catch (err) {

      setError(err.response?.data?.message || "Registration failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center 
    bg-linear-to-br from-indigo-500 via-purple-500 to-blue-500 p-6">

      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl 
      p-8 w-full max-w-xl">

        {/* Logo */}
        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-gray-800">
            🎯 InterviewPrep
          </h1>

          <p className="text-gray-500 mt-1">
            Create your account to start preparing
          </p>

        </div>


        {error && (

          <div className="bg-red-100 border border-red-200 
          text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>

        )}


        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              required
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500 transition"
            />

          </div>


          {/* Email */}
          <div>

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              required
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
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
              placeholder="Min 6 characters"
              value={form.password}
              required
              minLength={6}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500 transition"
            />

          </div>


          {/* Companies */}
          <div>

            <label className="block text-sm font-medium mb-2 text-gray-700">
              Target Companies (optional)
            </label>

            <div className="flex flex-wrap gap-2">

              {COMPANIES.map((company) => {

                const selected =
                  form.targetCompanies.includes(company);

                return (

                  <button
                    key={company}
                    type="button"
                    onClick={() => toggleCompany(company)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition
                    ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {company}
                  </button>

                );

              })}

            </div>

          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg
            font-semibold hover:bg-indigo-700 transition
            shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>


        <p className="text-sm text-center mt-6 text-gray-600">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );

};

export default RegisterPage;