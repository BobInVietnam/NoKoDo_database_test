import Sidebar from "@/components/Sidebar";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LessonsPage() {
  const decoded = await verifyAuth();
  if (!decoded) {
    redirect("/");
  }

  const tools = [
    { title: "Quản lý bài tập" },
    { title: "Quản lý bài kiểm tra" },
  ];
  return (
    <div className="container">
      <Sidebar />
      <div className="title">
        <h1>
          <b>Lessons</b>
        </h1>
      </div>
      <div className="card-grid">
        {tools.map((tool, index) => (
          <div className="tool-card" key={index}>
            <p>{tool.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
