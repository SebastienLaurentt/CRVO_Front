import UserVehicleList from "@/components/VehicleListByUserId";

const MemberDashboard = () => {
  return (
    <div>
      <h1 className="mb-4">Tableau de bord</h1>
      <UserVehicleList />
    </div>
  );
};

export default MemberDashboard;
