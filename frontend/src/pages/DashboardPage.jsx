import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProgress } from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


const StatCard = ({ icon, label, value, color, to }) => (

  <Link
    to={to}
    className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition"
    style={{ borderTop: `4px solid ${color}` }}
  >

    <span className="text-2xl">{icon}</span>

    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>

  </Link>

);



const DashboardPage = () => {
  
const [summary, setSummary] = useState(null);


const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    getProgress()
      .then((res) => {
        setData(res.data);
        setSummary(res.data.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading dashboard...
      </div>
    );
  }


  const s = data?.summary || {};
  const interviews = data?.recentInterviews || [];


  const chartData = [

    {
      name: "Easy",
      value: s.solvedByDifficulty?.Easy || 0,
      fill: "#22c55e",
    },

    {
      name: "Medium",
      value: s.solvedByDifficulty?.Medium || 0,
      fill: "#f59e0b",
    },

    {
      name: "Hard",
      value: s.solvedByDifficulty?.Hard || 0,
      fill: "#ef4444",
    },

  ];
  const difficultyData = [
  { name: "Easy", value: summary?.solvedByDifficulty?.Easy || 0 },
  { name: "Medium", value: summary?.solvedByDifficulty?.Medium || 0 },
  { name: "Hard", value: summary?.solvedByDifficulty?.Hard || 0 }
];
if (!summary) return <div>Loading dashboard...</div>;

return (
  <div className="space-y-8">

    {/* Header */}
    <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">

      <h1 className="text-3xl font-bold">
        Welcome back, {user?.name?.split(" ")[0]} 👋
      </h1>

      <p className="opacity-90">
        Keep up the momentum! Here's your preparation overview.
      </p>

    </div>


    {/* Stats Grid */}
    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5">

      <StatCard
        icon="💻"
        label="Problems Solved"
        value={s.totalSolved || 0}
        color="#6366f1"
        to="/dsa"
      />

      <StatCard
        icon="🤖"
        label="Interviews Taken"
        value={s.interviewStats?.totalInterviews || 0}
        color="#8b5cf6"
        to="/interview"
      />

      <StatCard
        icon="📚"
        label="Topics Completed"
        value={s.completedTopics || 0}
        color="#06b6d4"
        to="/subjects"
      />

      <StatCard
        icon="🧠"
        label="Quizzes Taken"
        value={s.quizzesTaken || 0}
        color="#10b981"
        to="/subjects"
      />

      <StatCard
        icon="⭐"
        label="Best Interview Score"
        value={`${s.interviewStats?.bestScore || 0}%`}
        color="#f59e0b"
        to="/progress"
      />

      <StatCard
        icon="🔥"
        label="Current Streak"
        value={`${s.currentStreak || 0} days`}
        color="#ef4444"
        to="/progress"
      />

    </div>



    {/* Main Grid */}
    <div className="grid lg:grid-cols-2 gap-6">

      {/* Difficulty Chart */}
     <ResponsiveContainer width="100%" height={260}>
  <PieChart>

    <Pie
      data={difficultyData}
      dataKey="value"
      nameKey="name"
      innerRadius={70}
      outerRadius={100}
      paddingAngle={5}
      animationDuration={1200}
      animationEasing="ease-out"
    >
      {difficultyData.map((entry, index) => (
        <Cell key={index} fill={COLORS[index]} />
      ))}
    </Pie>

    <Tooltip />
    <Legend />

  </PieChart>
</ResponsiveContainer>



      {/* Recent Interviews */}
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

        <h3 className="font-semibold text-lg mb-4">
          Recent Interviews
        </h3>

        {interviews.length === 0 ? (

          <div className="text-gray-500">

            No interviews yet.

            <Link
              to="/interview"
              className="text-blue-600 ml-2 font-medium"
            >
              Start one!
            </Link>

          </div>

        ) : (

          interviews.map((i) => (

            <div
              key={i._id}
              className="flex justify-between items-center border-b last:border-none py-3"
            >

              <div>

                <div className="font-semibold text-gray-800">
                  {i.title}
                </div>

                <div className="text-sm text-gray-500">
                  {i.type} • {i.company}
                </div>

              </div>

              <span
                className={`font-semibold text-lg ${
                  i.overallScore >= 70
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {i.overallScore}%
              </span>

            </div>

          ))

        )}

        <Link
          to="/interview"
          className="text-blue-600 text-sm mt-4 block font-medium"
        >
          View All Interviews →
        </Link>

      </div>



      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

        <h3 className="font-semibold text-lg mb-4">
          Quick Start
        </h3>

        <div className="grid grid-cols-2 gap-4">

          <Link
            to="/dsa"
            className="bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-medium transition"
          >
            💻 Practice DSA
          </Link>

          <Link
            to="/interview"
            className="bg-purple-500 hover:bg-purple-600 text-white text-center py-3 rounded-lg font-medium transition"
          >
            🤖 Mock Interview
          </Link>

          <Link
            to="/subjects"
            className="bg-teal-500 hover:bg-teal-600 text-white text-center py-3 rounded-lg font-medium transition"
          >
            📚 Study CS Topics
          </Link>

          <Link
            to="/progress"
            className="bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-lg font-medium transition"
          >
            📊 View Progress
          </Link>

        </div>

      </div>



      {/* Target Companies */}
      {user?.targetCompanies?.length > 0 && (

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

          <h3 className="font-semibold text-lg mb-4">
            Your Target Companies
          </h3>

          <div className="flex flex-wrap gap-3">

            {user.targetCompanies.map((c) => (

              <Link
                key={c}
                to={`/dsa?company=${c}`}
                className="px-4 py-1.5 bg-linear-to-r from-indigo-500 to-purple-600 
                text-white text-sm rounded-full shadow hover:scale-105 transition"
              >
                {c}
              </Link>

            ))}

          </div>

        </div>

      )}

    </div>

  </div>
);

};

export default DashboardPage;