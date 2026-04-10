import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditProblem = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form,setForm] = useState({});

  useEffect(async ()=>{

    const res = await axios.get(`http://localhost:5000/api/problems`);

    const problem = res.data.problems.find(p=>p._id===id);

    setForm(problem);

  },[]);

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();

    await axios.put(`http://localhost:5000/api/problems/${id}`,form);

    alert("Updated");

    navigate("/admin/problems");
  };

  return (

    <div className="admin-page">

      <h2>Edit Problem</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="title"
          value={form.title || ""}
          onChange={handleChange}
        />

        <select
          name="difficulty"
          value={form.difficulty || ""}
          onChange={handleChange}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <button type="submit">Update</button>

      </form>

    </div>
  );
};

export default EditProblem;