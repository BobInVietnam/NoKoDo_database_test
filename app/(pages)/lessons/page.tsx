import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LessonsPage() {
  const decoded = await verifyAuth();
  if (!decoded) {
    redirect("/");
  }

  const tools = [
    { title: "Quản lý bài tập", href: "/lessons/classes?type=lesson" },
    { title: "Quản lý bài kiểm tra", href: "/lessons/classes?type=test" },
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
          <Link href={tool.href} key={index} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="tool-card">
              <p><b>{tool.title}</b></p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
