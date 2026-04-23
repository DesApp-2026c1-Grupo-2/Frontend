import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/laboratorios" className="p-4 bg-blue-500 text-white rounded">
          Laboratorios
        </Link>

        <Link to="/pedidos" className="p-4 bg-green-500 text-white rounded">
          Pedidos
        </Link>

        <Link to="/logIn" className="p-4 bg-blue-500 text-white rounded">
          logIn
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;