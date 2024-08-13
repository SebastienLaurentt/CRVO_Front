import { useAuth } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";

const Dashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <div className="flex flex-col items-center"> 
      {role === "admin" && <AdminDashboard />}
      {role === "member" && <MemberDashboard />}
      {!role && <p>Loading...</p>}
    </div>
  );
};

export default Dashboard;
