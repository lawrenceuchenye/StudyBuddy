import "./index.css";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/";

const index = () => {
  return (
    <div className="main-root-div">
      <div>
        <Navbar />
      </div>
      <section>
        <Outlet />
      </section>
    </div>
  );
};

export default index;
