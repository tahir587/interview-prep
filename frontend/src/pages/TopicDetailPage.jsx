import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTopic, completeTopic, submitQuiz, aiExplain } from "../services/api";
import { decode } from "html-entities";
import { toast } from "react-toastify";

const TopicDetailPage = () => {
  const { subjectName, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    getTopic(subjectName, topicId)
      .then((res) => {
        setTopic(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load topic");
        setLoading(false);
      });
  }, [subjectName, topicId]);

  const handleCompleteTopic = async () => {
    setCompleting(true);
    try {
      await completeTopic(subjectName, topicId, { topicTitle: topic.title });
      toast.success("Topic marked as completed!");
    } catch (error) {
      toast.error("Failed to complete topic");
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!topic?.quiz || topic.quiz.length === 0) return;
    
    const answers = Object.values(quizAnswers);
    if (answers.length !== topic.quiz.length) {
      toast.error("Please answer all questions");
      return;
    }

    try {
      const res = await submitQuiz(subjectName, topicId, { answers });
      setQuizResult(res.data);
      toast.success(`Quiz completed! Score: ${res.data.score}/${res.data.total}`);
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  const handleAIExplain = async () => {
    setAiLoading(true);
    try {
      const res = await aiExplain({ topic: topic.title, subject: subjectName });
      setAiExplanation(res.data.explanation);
    } catch (error) {
      toast.error("Failed to get AI explanation");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Topic not found</p>
      </div>
    );
  }

  const decodedContent = decode(topic.content || "");

  const tabs = [
    { id: "content", label: "📖 Content" },
    { id: "interview", label: "🎤 Interview Q&A" },
    { id: "quiz", label: "✍️ Practice Quiz" },
    { id: "ai", label: "🤖 AI Explanation" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
          <p className="text-gray-500 mt-1">{subjectName}</p>
        </div>
        <button
          onClick={handleCompleteTopic}
          disabled={completing}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {completing ? "Marking..." : "✓ Mark Complete"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            {decodedContent ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: decodedContent }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No content available for this topic.</p>
                <p className="mt-2">Use the AI Explanation tab to learn more!</p>
              </div>
            )}
          </div>
        )}

        {/* Interview Questions Tab */}
        {activeTab === "interview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Common Interview Questions</h2>
            {topic.interviewQuestions && topic.interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                {topic.interviewQuestions.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start gap-3">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm font-medium">
                        Q{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.question}</p>
                        {item.answer && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-indigo-600 text-sm font-medium">
                              Show Answer
                            </summary>
                            <p className="mt-2 text-gray-600 bg-gray-50 p-3 rounded">
                              {item.answer}
                            </p>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No interview questions available for this topic.</p>
                <p className="mt-2">Use the AI Explanation tab to prepare!</p>
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Practice Quiz</h2>
            {quizResult ? (
              <div className="text-center py-8">
                <div className={`text-5xl font-bold mb-4 ${
                  quizResult.score / quizResult.total >= 0.7 ? "text-green-500" : "text-yellow-500"
                }`}>
                  {quizResult.score}/{quizResult.total}
                </div>
                <p className="text-gray-600 mb-6">
                  {quizResult.score / quizResult.total >= 0.7 
                    ? "Great job! You've mastered this topic!" 
                    : "Keep practicing to improve!"}
                </p>
                <div className="text-left space-y-4 max-w-2xl mx-auto">
                  {quizResult.results.map((result, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <p className="font-medium">Q{idx + 1}: {result.question}</p>
                      <p className="text-sm mt-1">
                        Your answer: <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                          {result.selectedAnswer !== undefined ? result.selectedAnswer : "Not answered"}
                        </span>
                      </p>
                      {!result.isCorrect && (
                        <p className="text-sm text-green-600">
                          Correct: {result.correctAnswer}
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-sm text-gray-600 mt-2">{result.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setQuizResult(null);
                    setQuizAnswers({});
                  }}
                  className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : topic.quiz && topic.quiz.length > 0 ? (
              <div className="space-y-6">
                {topic.quiz.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium mb-3">
                      <span className="text-indigo-600 mr-2">Q{index + 1}.</span>
                      {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                            quizAnswers[index] === optIndex
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optIndex}
                            checked={quizAnswers[index] === optIndex}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [index]: optIndex })}
                            className="mr-3"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleQuizSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Submit Quiz
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No quiz questions available for this topic.</p>
                <p className="mt-2">Add quiz questions via admin panel.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Explanation Tab */}
        {activeTab === "ai" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI-Powered Explanation</h2>
              <button
                onClick={handleAIExplain}
                disabled={aiLoading}
                className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  "✨ Get AI Explanation"
                )}
              </button>
            </div>
            
            {aiLoading && (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">AI is thinking...</p>
                </div>
              </div>
            )}

            {aiExplanation && !aiLoading && (
              <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{aiExplanation}</p>
                </div>
              </div>
            )}

            {!aiExplanation && !aiLoading && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🤖</div>
                <p>Click "Get AI Explanation" to receive a personalized explanation of this topic.</p>
                <p className="mt-2 text-sm">Powered by Groq AI</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;

