import { Outlet } from "react-router";
import Header from "../components/Header";

const Public = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Public;
