import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, show welcome with navigation
  if (!loading && user) {
    const features = [
      {
        icon: "💻",
        title: "DSA Practice",
        description: "Master data structures and algorithms with curated problems from top companies.",
        path: "/dsa",
      },
      {
        icon: "🤖",
        title: "AI Mock Interviews",
        description: "Practice with AI-powered interviews that simulate real company interviews.",
        path: "/interview",
      },
      {
        icon: "📚",
        title: "CS Subjects",
        description: "Comprehensive coverage of computer science fundamentals and theory.",
        path: "/subjects",
      },
      {
        icon: "📊",
        title: "Progress Tracking",
        description: "Track your preparation journey with detailed analytics and insights.",
        path: "/progress",
      },
    ];

    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-xl shadow mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-lg opacity-90">
              Ready to continue your interview preparation journey?
            </p>
          </div>

          {/* Features Grid */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Choose where to start
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.path}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 border-t-4 border-indigo-500 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user view
  const features = [
    {
      icon: "💻",
      title: "DSA Practice",
      description: "Master data structures and algorithms with curated problems from top companies.",
    },
    {
      icon: "🤖",
      title: "AI Mock Interviews",
      description: "Practice with AI-powered interviews that simulate real company interviews.",
    },
    {
      icon: "📚",
      title: "CS Subjects",
      description: "Comprehensive coverage of computer science fundamentals and theory.",
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Track your preparation journey with detailed analytics and insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="bg-linear-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🎯 InterviewPrep
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Your all-in-one platform to ace technical interviews. Practice DSA, 
              take AI-powered mock interviews, and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Everything You Need to Crack the Interview
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and resources 
            you need to land your dream job.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 border-t-4 border-indigo-500"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who have successfully landed their dream jobs.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Get Started Now - It's Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2024 InterviewPrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

