import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjects } from "../services/api";

const SUBJECT_META = {
  "Operating Systems": {
    icon: "🖥️",
    color: "bg-indigo-100 text-indigo-600",
    desc: "Processes, Memory, Scheduling, Deadlocks",
  },
  DBMS: {
    icon: "🗄️",
    color: "bg-purple-100 text-purple-600",
    desc: "SQL, Normalization, Transactions, Indexing",
  },
  "Computer Networks": {
    icon: "🌐",
    color: "bg-cyan-100 text-cyan-600",
    desc: "OSI Model, TCP/IP, HTTP, Security",
  },
  OOPs: {
    icon: "🧩",
    color: "bg-green-100 text-green-600",
    desc: "Encapsulation, Inheritance, Polymorphism",
  },
};

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    getSubjects()
      .then((r) => setSubjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // fallback if DB not seeded
  const displaySubjects =
    subjects.length > 0
      ? subjects
      : Object.entries(SUBJECT_META).map(([name]) => ({
          name,
          totalTopics: 0,
          _id: name,
        }));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📚 CS Subject Preparation</h1>
        <p className="text-gray-600">
          Master core computer science concepts with structured topics,
          interview Q&A, and quizzes.
        </p>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="text-center py-10">Loading subjects...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {displaySubjects.map((subject) => {
            const meta =
              SUBJECT_META[subject.name] || {
                icon: "📖",
                color: "bg-gray-100 text-gray-600",
                desc: "",
              };

            return (
              <div
                key={subject._id || subject.name}
                onClick={() =>
                  navigate(`/subjects/${encodeURIComponent(subject.name)}`)
                }
                className="bg-white shadow rounded-lg p-5 cursor-pointer hover:shadow-md transition"
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded text-xl ${meta.color}`}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1">

                    <h3 className="font-semibold">
                      {subject.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {meta.desc}
                    </p>

                    <div className="text-xs text-gray-400 mt-1">
                      {subject.totalTopics ||
                        subject.topics?.length ||
                        0}{" "}
                      topics
                    </div>

                  </div>

                  <span className="text-gray-400 text-lg">
                    →
                  </span>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Info Section */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📖</div>
          <h4 className="font-semibold">Topic Explanations</h4>
          <p className="text-sm text-gray-500">
            Detailed notes covering all important concepts.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎤</div>
          <h4 className="font-semibold">Interview Questions</h4>
          <p className="text-sm text-gray-500">
            Curated Q&A asked in technical interviews.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🧠</div>
          <h4 className="font-semibold">Practice Quizzes</h4>
          <p className="text-sm text-gray-500">
            Test your understanding with MCQ quizzes.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🤖</div>
          <h4 className="font-semibold">AI Explanations</h4>
          <p className="text-sm text-gray-500">
            Ask AI to explain any concept for interviews.
          </p>
        </div>

      </div>

    </div>
  );
};

export default SubjectsPage;