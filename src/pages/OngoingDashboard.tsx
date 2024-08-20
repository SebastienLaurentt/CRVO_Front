import { useAuth } from "@/lib/auth";
import AdminOngoing from "./Admin/AdminOngoing";
import MemberOngoing from "./Members/MemberOngoing";

const OngoingDashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <>
      {role === "admin" && <AdminOngoing />}
      {role === "member" && <MemberOngoing />}
    </>
  );
};

export default OngoingDashboard;
