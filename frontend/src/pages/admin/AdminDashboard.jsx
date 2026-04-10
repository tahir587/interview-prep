import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {

  const cards = [
    {
      title: "Manage DSA Problems",
      icon: "📋",
      link: "/admin/problems",
      color: "from-blue-500 to-indigo-500",
      desc: "Edit, delete or manage all DSA problems"
    },
    {
      title: "Add Problem",
      icon: "➕",
      link: "/admin/add-problem",
      color: "from-green-500 to-emerald-500",
      desc: "Add new coding problems to the database"
    },
    {
      title: "Manage Subjects",
      icon: "📚",
      link: "/admin/subjects",
      color: "from-purple-500 to-pink-500",
      desc: "View and manage CS subjects"
    },
    {
      title: "Add Subject",
      icon: "📝",
      link: "/admin/add-subject",
      color: "from-orange-500 to-red-500",
      desc: "Create new subjects for interview prep"
    }
  ];

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">

        <h1 className="text-3xl font-bold">
          ⚙️ Admin Panel
        </h1>

        <p className="text-sm opacity-90">
          Manage problems, subjects, and platform content
        </p>

      </div>


      {/* Admin Cards */}

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">

        {cards.map((card) => (

          <Link
            key={card.title}
            to={card.link}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex items-center gap-4 group"
          >

            <div className={`text-white text-2xl p-3 rounded-lg bg-linear-to-r ${card.color}`}>
              {card.icon}
            </div>

            <div>

              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                {card.title}
              </h3>

              <p className="text-sm text-gray-500">
                {card.desc}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </div>

  );

};

export default AdminDashboard;