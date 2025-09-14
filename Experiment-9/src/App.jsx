// src/App.jsx
import React, { useState } from "react";
import { Student, Teacher } from "./PersonClasses";

export default function App() {
  const [output, setOutput] = useState("");

  // Create instances
  const student = new Student("Alice", 20, "Computer Science");
  const teacher = new Teacher("Mr. Smith", 45, "Mathematics");

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Person Class Hierarchy (React)</h1>

      <div className="space-x-3">
        <button
          onClick={() => setOutput(student.displayInfo())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Show Student Info
        </button>

        <button
          onClick={() => setOutput(teacher.displayInfo())}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Show Teacher Info
        </button>
      </div>

      <div className="mt-6 p-4 border rounded-lg bg-gray-100 min-h-[50px]">
        {output || "Click a button to display info"}
      </div>
    </div>
  );
}
