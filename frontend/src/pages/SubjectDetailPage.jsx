import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getSubject,
  completeTopic,
  submitQuiz as submitQuizAPI,
  aiExplain,
} from "../services/api";
import { toast } from "react-toastify";

const SubjectDetailPage = () => {
  const { name } = useParams();

  const [subject, setSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [activeTab, setActiveTab] = useState("content");

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubject(decodeURIComponent(name))
      .then((r) => {
        setSubject(r.data);
        if (r.data.topics?.length) {
          setSelectedTopic(r.data.topics[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [name]);

  const handleCompleteTopic = async () => {
    try {
      await completeTopic(subject.name, selectedTopic._id, {
        topicTitle: selectedTopic.title,
      });
      toast.success("Topic marked as completed!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQuiz = async () => {
    const answers = selectedTopic.quiz.map((_, i) => quizAnswers[i] ?? -1);

    try {
      const res = await submitQuizAPI(subject.name, selectedTopic._id, {
        answers,
      });

      setQuizResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiExplain = async () => {
    setAiLoading(true);
    setAiExplanation("");

    try {
      const res = await aiExplain({
        topic: selectedTopic.title,
        subject: subject.name,
      });

      setAiExplanation(res.data.explanation);
    } catch {
      setAiExplanation("AI explanation unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading subject...</div>;
  if (!subject)
    return <div className="text-center py-10">Subject not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">📚 {subject.name}</h1>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: subject.description || "" }}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white shadow rounded-lg p-4 space-y-2">
          <h3 className="font-semibold mb-2">Topics</h3>

          {subject.topics?.length > 0 ? (
            subject.topics.map((t) => (
              <button
                key={t._id}
                onClick={() => {
                  setSelectedTopic(t);
                  setActiveTab("content");
                  setQuizResult(null);
                  setAiExplanation("");
                }}
                className={`block w-full text-left px-3 py-2 rounded ${
                  selectedTopic?._id === t._id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {t.title}
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No topics yet</p>
          )}
        </div>

        {/* Topic Content */}
        {selectedTopic && (
          <div className="md:col-span-3 bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedTopic.title}</h2>

              <button
                onClick={handleCompleteTopic}
                className="border px-3 py-1 rounded"
              >
                Mark Complete
              </button>
            </div>


            {/* Feature Cards */}

            <div className="grid md:grid-cols-4 gap-4 mb-4 relative z-10">
              <div
                onClick={() => setActiveTab("content")}
                className={`border rounded-lg p-4 text-center cursor-pointer transition
    ${
      activeTab === "content"
        ? "bg-blue-100 border-blue-500"
        : "bg-gray-50 hover:shadow"
    }
    `}
              >
                <div className="text-2xl mb-1">📖</div>
                <h4 className="font-semibold">Topic Explanations</h4>
                <p className="text-xs text-gray-500">
                  Detailed notes covering all important concepts.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("questions")}
                className={`border rounded-lg p-4 text-center cursor-pointer transition
    ${
      activeTab === "questions"
        ? "bg-blue-100 border-blue-500"
        : "bg-gray-50 hover:shadow"
    }
    `}
              >
                <div className="text-2xl mb-1">🎤</div>
                <h4 className="font-semibold">Interview Questions</h4>
                <p className="text-xs text-gray-500">
                  Curated Q&A asked in technical interviews.
                </p>
              </div>

            <div
  onClick={() => setActiveTab("quiz")}
  className={`border rounded-lg p-4 text-center cursor-pointer transition ${
    activeTab === "quiz"
      ? "bg-blue-100 border-blue-500"
      : "bg-gray-50 hover:shadow"
  }`}
>
  <div className="text-2xl mb-1">🧠</div>
  <h4 className="font-semibold">Practice Quizzes</h4>
  <p className="text-xs text-gray-500">
    Test your understanding with MCQ quizzes.
  </p>
</div>

              <div
                onClick={() => setActiveTab("ai")}
                className={`border rounded-lg p-4 text-center cursor-pointer transition
             ${
      activeTab === "ai"
        ? "bg-blue-100 border-blue-500"
        : "bg-gray-50 hover:shadow"
    }
    `}
              >
                <div className="text-2xl mb-1">🤖</div>
                <h4 className="font-semibold">AI Explanations</h4>
                <p className="text-xs text-gray-500">
                  Ask AI to explain any concept for interviews.
                </p>
              </div>
            </div>

            {/* Tabs */}

            <div className="flex gap-2 border-b pb-2">
              {["content", "questions", "quiz", "ai"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded ${
                    activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {
                    {
                      content: "Notes",
                      questions: "Interview Q&A",
                      quiz: "Quiz",
                      ai: "AI Explain",
                    }[tab]
                  }
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}

            {activeTab === "content" && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: selectedTopic.content || "<p>Notes coming soon.</p>",
                }}
              />
            )}

            {activeTab === "questions" && (
              <div className="space-y-3">
                {selectedTopic.interviewQuestions?.length > 0 ? (
                  selectedTopic.interviewQuestions.map((iq, i) => (
                    <details key={i} className="border p-3 rounded">
                      <summary className="font-medium">
                        Q{i + 1}. {iq.question}
                      </summary>
                      <p className="mt-2 text-gray-600">{iq.answer}</p>
                    </details>
                  ))
                ) : (
                  <p className="text-gray-400">Questions coming soon</p>
                )}
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="space-y-4">
                {!quizResult ? (
                  <>
                    {selectedTopic.quiz?.map((q, i) => (
                      <div key={i}>
                        <p className="font-medium">
                          Q{i + 1}. {q.question}
                        </p>

                        {q.options.map((opt, j) => (
                          <label key={j} className="block text-sm">
                            <input
                              type="radio"
                              name={`q${i}`}
                              onChange={() =>
                                setQuizAnswers((a) => ({
                                  ...a,
                                  [i]: j,
                                }))
                              }
                            />{" "}
                            {opt}
                          </label>
                        ))}
                      </div>
                    ))}

                    <button
                      onClick={handleSubmitQuiz}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Submit Quiz
                    </button>
                  </>
                ) : (
                  <div>
                    <h3 className="font-semibold">
                      Score: {quizResult.score}/{quizResult.total}
                    </h3>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-3">
                <button
                  onClick={handleAiExplain}
                  disabled={aiLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  {aiLoading ? "Generating..." : "Get AI Explanation"}
                </button>

                {aiExplanation && (
                  <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
                    {aiExplanation}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetailPage;
