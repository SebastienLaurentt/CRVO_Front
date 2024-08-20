import { useAuth } from "@/lib/auth";
import AdminCompleted from "./AdminCompleted";
import MemberOngoing from "./MemberOngoing";
import Nav from "@/components/Nav";

const CompletedDashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <div className="flex flex-row gap-x-4 my-8 ml-8">
      <>
        <Nav />
        <AdminCompleted />
      </>
      {role === "member" && <MemberOngoing />}
      {!role && <p>Loading...</p>}
    </div>
  );
};

export default CompletedDashboard;
