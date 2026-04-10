import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";

const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Flipkart",
  "Infosys",
  "TCS",
  "Wipro",
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    targetCompanies: user?.targetCompanies || [],
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleCompany = (c) =>
    setForm((f) => ({
      ...f,
      targetCompanies: f.targetCompanies.includes(c)
        ? f.targetCompanies.filter((x) => x !== c)
        : [...f.targetCompanies, c],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateProfile(form);
      updateUser(res.data);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">👤 Profile Settings</h1>
        <p className="opacity-90 text-sm">
          Manage your personal information and target companies
        </p>
      </div>

      {/* Card */}
      <div className="bg-white shadow rounded-xl p-6 space-y-6">

        {/* Profile Info */}
        <div className="flex items-center gap-4">

          <div className="w-14 h-14 flex items-center justify-center rounded-full 
          bg-indigo-600 text-white text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>

        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email (cannot be changed)
            </label>

            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500"
            />
          </div>

          {/* Target Companies */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Companies
            </label>

            <div className="flex flex-wrap gap-2">

              {COMPANIES.map((c) => {

                const selected = form.targetCompanies.includes(c);

                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleCompany(c)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition
                    ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}

            </div>

          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold
            hover:bg-indigo-700 transition shadow disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default ProfilePage;