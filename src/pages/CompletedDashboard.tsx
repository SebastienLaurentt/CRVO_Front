import { useAuth } from "@/lib/auth";
import AdminCompleted from "./Admin/AdminCompleted";
import MemberCompleted from "./Members/MemberCompleted";

const CompletedDashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <>
      {role === "admin" && <AdminCompleted />}
      {role === "member" && <MemberCompleted />}
    </>
  );
};

export default CompletedDashboard;
