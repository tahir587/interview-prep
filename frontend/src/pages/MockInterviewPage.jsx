import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterviews, startInterview } from "../services/api";

const TYPES = ["DSA", "Technical", "Behavioral", "System Design"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const COMPANIES = [
  "General",
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Flipkart",
];

const MockInterviewPage = () => {

  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const [form, setForm] = useState({
    type: "DSA",
    company: "General",
    difficulty: "Medium",
    questionCount: 5
  });

  const navigate = useNavigate();


  useEffect(() => {

    setLoading(true);

    getInterviews()
      .then((r) => setInterviews(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  }, []);


  const handleStart = async (e) => {

    e.preventDefault();

    setStarting(true);

    try {

      const res = await startInterview(form);

      // Navigate to interview session
      navigate(`/interview/${res.data._id}`);

    } catch (err) {

      alert(
        err.response?.data?.message ||
          "Failed to start interview"
      );

      setStarting(false);

    }

  };

  const handleContinue = (interview) => {
    navigate(`/interview/${interview._id}`);
  };

  const scoreColor = (score) =>
    score >= 70
      ? "text-green-500"
      : score >= 50
      ? "text-yellow-500"
      : "text-red-500";


  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          🤖 Mock Interviews
        </h1>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "✕ Cancel" : "+ New Interview"}
        </button>

      </div>


      {/* Start Interview Form */}

      {showForm && (

        <div className="bg-white shadow rounded-lg p-6">

          <h3 className="font-semibold mb-4">
            Configure Your Interview
          </h3>

          <form
            onSubmit={handleStart}
            className="grid md:grid-cols-4 gap-4"
          >

            {/* Type */}

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
            >

              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}

            </select>


            {/* Company */}

            <select
              value={form.company}
              onChange={(e) =>
                setForm({
                  ...form,
                  company: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
            >

              {COMPANIES.map((c) => (
                <option key={c}>{c}</option>
              ))}

            </select>


            {/* Difficulty */}

            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm({
                  ...form,
                  difficulty: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
            >

              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}

            </select>


            {/* Question Count */}

            <div className="flex flex-col">

              <label className="text-sm mb-1">
                Questions ({form.questionCount})
              </label>

              <input
                type="range"
                min="3"
                max="10"
                value={form.questionCount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    questionCount: Number(
                      e.target.value
                    ),
                  })
                }
              />

            </div>


            <div className="md:col-span-4">

              <button
                type="submit"
                disabled={starting}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >

                {starting
                  ? "⏳ Generating questions..."
                  : "🚀 Start Interview"}

              </button>

            </div>

          </form>

        </div>

      )}



      {/* Past Interviews */}

      <h2 className="text-xl font-semibold">
        Your Interviews
      </h2>


      {loading ? (

        <div className="text-center py-10">
          Loading...
        </div>

      ) : interviews.length === 0 ? (

        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No interviews yet. Start your first one!
        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {interviews.map((i) => (

            <div
              key={i._id}
              className="bg-white shadow rounded-lg p-4 hover:shadow-md transition"
            >

              <div className="flex justify-between items-start mb-3">

                <h4 className="font-semibold">
                  {i.title}
                </h4>

                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {i.status}
                </span>

              </div>

              <div className="text-sm text-gray-500 mt-2 space-y-1">

                <div>🏢 {i.company}</div>

                <div>📋 {i.type}</div>

                <div>⚡ {i.difficulty}</div>

              </div>

              {/* Continue Button */}
              {i.status !== "completed" && (
                <div className="mt-3">
                  <button
                    onClick={() => handleContinue(i)}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded text-sm font-medium transition"
                  >
                    💬 Continue
                  </button>
                </div>
              )}

              {i.status === "completed" && (

                <div className="mt-3">

                  <div className="text-sm mb-1">
                    Score
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded">

                    <div
                      className="h-2 rounded bg-green-500"
                      style={{
                        width: `${i.overallScore}%`,
                      }}
                    />

                  </div>

                  <div
                    className={`text-sm mt-1 ${scoreColor(
                      i.overallScore
                    )}`}
                  >
                    {i.overallScore}%
                  </div>

                </div>

              )}


              <div className="text-xs text-gray-400 mt-3">
                {new Date(
                  i.createdAt
                ).toLocaleDateString()}
              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default MockInterviewPage;

