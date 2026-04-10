import { useState } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { addTopic } from "../../services/api";
import { toast } from "react-toastify";

const modules = {
  toolbar: [
    [{ header: [1,2,3,false] }],
    ["bold","italic","underline"],
    [{ list:"ordered" },{ list:"bullet" }],
    ["code-block"],
    ["link"],
    ["clean"]
  ]
};

export default function AddTopic(){

  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  
  // Interview Questions
  const [interviewQuestions, setInterviewQuestions] = useState([
    { question: "", answer: "" }
  ]);

  // Quiz Questions
  const [quizQuestions, setQuizQuestions] = useState([
    { 
      question: "", 
      options: ["", "", "", ""], 
      correctAnswer: 0, 
      explanation: "" 
    }
  ]);

  const addInterviewQuestion = () => {
    setInterviewQuestions([...interviewQuestions, { question: "", answer: "" }]);
  };

  const removeInterviewQuestion = (index) => {
    setInterviewQuestions(interviewQuestions.filter((_, i) => i !== index));
  };

  const updateInterviewQuestion = (index, field, value) => {
    const updated = [...interviewQuestions];
    updated[index][field] = value;
    setInterviewQuestions(updated);
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { 
      question: "", 
      options: ["", "", "", ""], 
      correctAnswer: 0, 
      explanation: "" 
    }]);
  };

  const removeQuizQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const updateQuizQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const updateQuizOption = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a topic title");
      return;
    }

    // Filter out empty questions
    const filteredInterviewQuestions = interviewQuestions.filter(
      q => q.question.trim() !== ""
    );

    const filteredQuizQuestions = quizQuestions.filter(
      q => q.question.trim() !== "" && q.options.some(o => o.trim() !== "")
    );

    await addTopic(id, {
      title,
      content,
      interviewQuestions: filteredInterviewQuestions,
      quiz: filteredQuizQuestions
    });

    toast.success("Topic Added Successfully");

    // Reset form
    setTitle("");
    setContent("");
    setInterviewQuestions([{ question: "", answer: "" }]);
    setQuizQuestions([{ 
      question: "", 
      options: ["", "", "", ""], 
      correctAnswer: 0, 
      explanation: "" 
    }]);
  };

  const tabs = [
    { id: "content", label: "📖 Content" },
    { id: "interview", label: "🎤 Interview Q&A" },
    { id: "quiz", label: "✍️ Quiz Questions" },
  ];

  return(
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">
        Add Topic
      </h2>

      <form onSubmit={submit} className="space-y-4">

        <input
          placeholder="Topic Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border rounded p-2"
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
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

        {/* Content Tab */}
        {activeTab === "content" && (
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
          />
        )}

        {/* Interview Questions Tab */}
        {activeTab === "interview" && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Add common interview questions and their answers for this topic.</p>
            {interviewQuestions.map((iq, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Question {index + 1}</span>
                  {interviewQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInterviewQuestion(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  placeholder="Enter interview question"
                  value={iq.question}
                  onChange={(e) => updateInterviewQuestion(index, "question", e.target.value)}
                  className="w-full border rounded p-2 mb-2"
                />
                <textarea
                  placeholder="Enter answer"
                  value={iq.answer}
                  onChange={(e) => updateInterviewQuestion(index, "answer", e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addInterviewQuestion}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Interview Question
            </button>
          </div>
        )}

        {/* Quiz Questions Tab */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Add quiz questions with multiple choice options.</p>
            {quizQuestions.map((q, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Question {index + 1}</span>
                  {quizQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuizQuestion(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  placeholder="Enter quiz question"
                  value={q.question}
                  onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
                  className="w-full border rounded p-2 mb-3"
                />
                
                <div className="space-y-2 mb-3">
                  <p className="font-medium text-sm">Options (select correct answer):</p>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={q.correctAnswer === optIndex}
                        onChange={() => updateQuizQuestion(index, "correctAnswer", optIndex)}
                        className="w-4 h-4"
                      />
                      <input
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateQuizOption(index, optIndex, e.target.value)}
                        className="flex-1 border rounded p-2"
                      />
                    </div>
                  ))}
                </div>
                
                <textarea
                  placeholder="Explanation (optional)"
                  value={q.explanation}
                  onChange={(e) => updateQuizQuestion(index, "explanation", e.target.value)}
                  className="w-full border rounded p-2"
                  rows={2}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addQuizQuestion}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Quiz Question
            </button>
          </div>
        )}

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
          Add Topic
        </button>

      </form>
    </div>
  );
}

