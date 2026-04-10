import { useState } from "react";
import { createSubject } from "../../services/api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";


const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["code-block"],
    ["link"],
    ["clean"],
  ],
};

export default function AddSubject() {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await createSubject(form);

      console.log(res);

       toast.success("Subject Added Successfully");

      setForm({
        name: "",
        description: "",
      });
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to add subject");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">📚 Add New Subject</h1>

        <p className="text-sm opacity-90">
          Create a new CS subject for interview preparation
        </p>
      </div>

      {/* Form Card */}

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={submit} className="space-y-5">
          {/* Subject Name */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Subject Name
            </label>

            <input
              placeholder="Operating Systems"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2
              focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Description */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>

            <ReactQuill
              theme="snow"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              modules={modules}
              className="bg-white"
            />
          </div>

          {/* Submit Button */}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg
            font-semibold hover:bg-indigo-700 transition shadow"
          >
            Add Subject
          </button>
        </form>
      </div>
    </div>
  );
}
