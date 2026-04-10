import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ManageProblems = () => {

  const [problems, setProblems] = useState([]);

  const fetchProblems = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/problems",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProblems(res.data.problems || res.data);

    } catch (err) {
      console.error(err);
    }

  };

  useEffect(() => {
    fetchProblems();
  }, []);


  const deleteProblem = async (id) => {

    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/problems/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProblems(problems.filter(p => p._id !== id));

    } catch (err) {
      console.error(err);
      alert("Failed to delete problem");
    }

  };

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold">
          📋 Manage DSA Problems
        </h1>

        <p className="text-sm opacity-90">
          Edit or delete problems from the platform
        </p>

      </div>


      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">

            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-center">Difficulty</th>
              <th className="p-4 text-center">Topic</th>
              <th className="p-4 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {problems.map((p) => (

              <tr
                key={p._id}
                className="border-t hover:bg-gray-50 transition"
              >

                <td className="p-4 font-medium text-gray-800">
                  {p.title}
                </td>


                <td className="p-4 text-center">

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold
                    ${
                      p.difficulty === "Easy"
                        ? "bg-green-100 text-green-700"
                        : p.difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.difficulty}
                  </span>

                </td>


                <td className="p-4 text-center text-gray-600">
                  {p.topic}
                </td>


                <td className="p-4 text-center flex justify-center gap-3">

                  <Link
                    to={`/admin/edit-problem/${p._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </Link>


                  <button
                    onClick={() => deleteProblem(p._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default ManageProblems;