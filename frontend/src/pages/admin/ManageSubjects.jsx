import { useEffect,useState } from "react";
import { getSubjects } from "../../services/api";
import { Link } from "react-router-dom";

export default function ManageSubjects(){

  const [subjects,setSubjects] = useState([]);

  useEffect(()=>{
    getSubjects().then(res=>setSubjects(res.data));
  },[]);

  return(

    <div className="space-y-4">

      <h2 className="text-xl font-bold">Manage Subjects</h2>

      {subjects.map(s=>(

        <div key={s._id} className="bg-white p-4 rounded shadow flex justify-between">

          <div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500">
              {s.topics.length} topics
            </p>
          </div>

          <Link
            to={`/admin/subjects/${s._id}/add-topic`}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Add Topic
          </Link>

        </div>

      ))}

    </div>

  );

}