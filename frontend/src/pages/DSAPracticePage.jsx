import React, { useEffect, useState, useCallback } from "react";
import {
  getProblems,
  getCompanies,
  getTopics,
  markSolved,
  unmarkSolved,
  getSolvedIds,
} from "../services/api";

import { useSearchParams } from "react-router-dom";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const PLATFORMS = ["All", "LeetCode", "GeeksforGeeks"];

const DifficultyBadge = ({ level }) => {
  const colors = {
    Easy: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Hard: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full border ${colors[level]}`}
    >
      {level}
    </span>
  );
};

const PlatformBadge = ({ platform }) => {
  const styles =
    platform === "LeetCode"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles}`}>
      {platform}
    </span>
  );
};

const DSAPracticePage = () => {
  const [searchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    company: searchParams.get("company") || "",
    difficulty: "",
    topic: "",
    platform: "",
    page: 1,
  });

  const fetchProblems = useCallback(async () => {
    setLoading(true);

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );

      const res = await getProblems(params);

      setProblems(res.data.problems);

      setPagination({
        page: res.data.page,
        pages: res.data.pages,
        total: res.data.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getCompanies().then((r) => setCompanies(r.data));
    getTopics().then((r) => setTopics(r.data));

    getSolvedIds().then((r) => setSolvedIds(new Set(r.data)));
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const toggleSolved = async (problem) => {
    console.log("Clicked", problem._id);
    try {
      if (solvedIds.has(problem._id)) {
        await unmarkSolved(problem._id);

        setSolvedIds((s) => {
          const n = new Set(s);
          n.delete(problem._id);
          return n;
        });
      } else {
        await markSolved(problem._id);
        setSolvedIds((s) => new Set([...s, problem._id]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 ">

      {/* Header */}

      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 my-5 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold flex items-center gap-2">
          💻 DSA Practice
        </h1>

        <p className="opacity-90 text-sm mt-1">
          {pagination.total} problems from LeetCode & GeeksforGeeks
        </p>

      </div>


      {/* Filters */}

      <div className="bg-white rounded-xl shadow p-5 flex flex-wrap gap-4 items-center">

        <select
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          value={filters.company}
          onChange={(e) => setFilter("company", e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          value={filters.topic}
          onChange={(e) => setFilter("topic", e.target.value)}
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.difficulty === (d === "All" ? "" : d)
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("difficulty", d === "All" ? "" : d)}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.platform === (p === "All" ? "" : p)
                  ? "bg-purple-500 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("platform", p === "All" ? "" : p)}
            >
              {p}
            </button>
          ))}
        </div>

      </div>


      {/* Table */}

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading problems...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">

              <tr>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-center">Difficulty</th>
                <th className="p-4">Topic</th>
                <th className="p-4 text-center">Platform</th>
                <th className="p-4 text-center">Action</th>
              </tr>

            </thead>

            <tbody className="h-full">

              {problems.map((p) => (

                <tr
                  key={p._id}
                  className={`border-t transition hover:bg-indigo-50 h-12 ${
                    solvedIds.has(p._id) ? "bg-green-50" : ""
                  }`}
                 >

                  <td className="text-center">

                    <button
                      onClick={() => toggleSolved(p)}
                      className={`w-5 mx-auto h-6 rounded border flex items-center justify-center transition
                      ${
                        solvedIds.has(p._id)
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {solvedIds.has(p._id) && "✓"}
                    </button>

                  </td>


                  <td className="font-medium text-gray-700">

                    <a
                      href={p.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-indigo-600 hover:underline"
                    >
                      {p.title}
                    </a>

                  </td>


                  <td className="text-center px-1.5 py-1">
                    <DifficultyBadge level={p.difficulty} />
                  </td>


                  <td className="text-gray-600">{p.topic}</td>


                  <td className="text-center">
                    <PlatformBadge platform={p.platform} />
                  </td>


                  <td className="text-center">

                    <a
                      href={p.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-1 py-1 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
                    >
                      Solve →
                    </a>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}


      {/* Pagination */}

      <div className="flex justify-between items-center">

        <button
          disabled={pagination.page <= 1}
          onClick={() =>
            setFilters((f) => ({
              ...f,
              page: f.page - 1,
            }))
          }
          className="px-2 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
        >
          ← Prev
        </button>

        <span className="font-medium text-gray-700">
          Page {pagination.page} of {pagination.pages}
        </span>

        <button
          disabled={pagination.page >= pagination.pages}
          onClick={() =>
            setFilters((f) => ({
              ...f,
              page: f.page + 1,
            }))
          }
          className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
        >
          Next →
        </button>

      </div>

    </div>
  );
};

export default DSAPracticePage;