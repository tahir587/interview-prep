import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddProblem = () => {

  const [form, setForm] = useState({
    title: "",
    difficulty: "Easy",
    topic: "",
    platform: "LeetCode",
    externalUrl: "",
    companies: "",
    tags: "",
    description: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      const payload = {
        ...form,
        companies: form.companies
          ? form.companies.split(",").map(c => c.trim())
          : [],
        tags: form.tags
          ? form.tags.split(",").map(t => t.trim())
          : []
      };

      await axios.post(
        "http://localhost:5000/api/problems",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Problem Added Successfully");

      setForm({
        title: "",
        difficulty: "Easy",
        topic: "",
        platform: "LeetCode",
        externalUrl: "",
        companies: "",
        tags: "",
        description: ""
      });

    } catch (err) {
      console.error(err);
      alert("Failed to add problem");
    }
  };

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold">
          ➕ Add New DSA Problem
        </h1>

        <p className="text-sm opacity-90">
          Add problems to your practice database
        </p>

      </div>


      {/* Form Card */}

      <div className="bg-white rounded-xl shadow p-6">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Problem Title
            </label>

            <input
              name="title"
              placeholder="Two Sum"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>


          {/* Difficulty + Platform */}

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="block text-sm font-medium mb-1">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

            </div>


            <div>

              <label className="block text-sm font-medium mb-1">
                Platform
              </label>

              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option>LeetCode</option>
                <option>GeeksforGeeks</option>
              </select>

            </div>

          </div>


          {/* Topic */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Topic
            </label>

            <input
              name="topic"
              placeholder="Array, Dynamic Programming..."
              value={form.topic}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none"
            />

          </div>


          {/* URL */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Problem URL
            </label>

            <input
              name="externalUrl"
              placeholder="https://leetcode.com/problems/two-sum"
              value={form.externalUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none"
            />

          </div>


          {/* Companies */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Companies (comma separated)
            </label>

            <input
              name="companies"
              placeholder="Google, Amazon, Microsoft"
              value={form.companies}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none"
            />

          </div>


          {/* Tags */}

          


          {/* Description */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              placeholder="Optional description..."
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none"
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg
            font-semibold hover:bg-indigo-700 transition shadow"
          >
            Add Problem
          </button>

        </form>

      </div>

    </div>

  );
};

export default AddProblem;