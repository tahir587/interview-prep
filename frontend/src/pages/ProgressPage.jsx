import React, { useEffect, useState } from "react";
import { getProgress } from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-10">
        Loading progress...
      </div>
    );

  const s = data?.summary || {};
  const interviews = data?.recentInterviews || [];

  const diffData = [
    { name: "Easy", value: s.solvedByDifficulty?.Easy || 0 },
    { name: "Medium", value: s.solvedByDifficulty?.Medium || 0 },
    { name: "Hard", value: s.solvedByDifficulty?.Hard || 0 },
  ];

  const topicData = Object.entries(s.solvedByTopic || {})
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const completedSubjects = {};
  data?.progress?.completedTopics?.forEach((t) => {
    completedSubjects[t.subject] =
      (completedSubjects[t.subject] || 0) + 1;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">

  <h1 className="text-3xl font-bold">
    📊 Your Progress
  </h1>

  <p className="opacity-90">
    Track your interview preparation journey
  </p>

</div>


      {/* Stats */}

       <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5">

  {[
    { icon: "💻", label: "Problems Solved", value: s.totalSolved || 0 },
    { icon: "🔥", label: "Current Streak", value: `${s.currentStreak || 0}d` },
    { icon: "🎯", label: "Avg Interview Score", value: `${s.interviewStats?.averageScore || 0}%` },
    { icon: "🏆", label: "Best Interview Score", value: `${s.interviewStats?.bestScore || 0}%` },
    { icon: "📚", label: "Topics Completed", value: s.completedTopics || 0 },
    { icon: "🧠", label: "Quizzes Taken", value: s.quizzesTaken || 0 },
  ].map(({ icon, label, value }) => (

    <div
      key={label}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-5 flex gap-4 items-center"
    >

      <div className="text-3xl">{icon}</div>

      <div>
        <div className="text-xl font-bold text-gray-800">
          {value}
        </div>

        <div className="text-xs text-gray-500">
          {label}
        </div>
      </div>

    </div>

  ))}

</div>

      {/* Charts */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* Difficulty Pie Chart */}

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">

          <h3 className="font-semibold mb-2">
            Problems by Difficulty
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={diffData}
                dataKey="value"
                outerRadius={80}
                label
              >
                {diffData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

        </div>

        {/* Topic Bar Chart */}

        {topicData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">

            <h3 className="font-semibold mb-2">
              Problems by Topic
            </h3>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={topicData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={140}
                  tickFormatter={(value) => value.replace(",", ",\n")}
                   tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>
        )}

        {/* Subject Progress */}

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">

          <h3 className="font-semibold mb-3">
            CS Subject Progress
          </h3>

          {Object.keys(completedSubjects).length > 0 ? (
            Object.entries(completedSubjects).map(
              ([subj, count]) => (
                <div key={subj} className="mb-3">

                  <div className="flex justify-between text-sm mb-1">
                    <span>{subj}</span>
                    <span>{count} topics</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded">

                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{
                        width: `${Math.min(
                          100,
                          count * 10
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )
          ) : (
            <p className="text-gray-400 text-sm">
              Complete topics to see progress
            </p>
          )}

        </div>

        {/* Interview Score History */}

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">

          <h3 className="font-semibold mb-2">
            Recent Interview Scores
          </h3>

          {interviews.length > 0 ? (

            <ResponsiveContainer width="100%" height={200}>

              <BarChart
                data={interviews
                  .slice()
                  .reverse()
                  .map((i) => ({
                    name: i.title.split(" ")[0],
                    score: i.overallScore,
                  }))}
              >

                <XAxis dataKey="name" />

                <YAxis domain={[0, 100]} />

                <Tooltip formatter={(v) => `${v}%`} />

                <Bar
                  dataKey="score"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (
            <p className="text-gray-400 text-sm">
              No completed interviews yet.
            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProgressPage;