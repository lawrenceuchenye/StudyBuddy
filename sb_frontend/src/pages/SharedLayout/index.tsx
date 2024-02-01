import "./index.css";
import { FC } from "react";
import { Outlet } from "react-router-dom";

import { useStudyBudStore } from "../../store/";
import Navbar from "../../components/Navbar/";
import FootNavbar from "../../components/FootNavbar/";
import MobileMenu from "../../components/MobileMenu/";

const index: FC = () => {
  const isTapped = useStudyBudStore((state) => state.isTapped);
  return (
    <div>
      <Navbar />
      <section>
        <Outlet />
      </section>
      <svg
        style={{ position: "relative", top: "20px" }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#000"
          fill-opacity="1"
          d="M0,32L0,256L120,256L120,96L240,96L240,96L360,96L360,224L480,224L480,128L600,128L600,64L720,64L720,0L840,0L840,32L960,32L960,64L1080,64L1080,224L1200,224L1200,288L1320,288L1320,192L1440,192L1440,320L1320,320L1320,320L1200,320L1200,320L1080,320L1080,320L960,320L960,320L840,320L840,320L720,320L720,320L600,320L600,320L480,320L480,320L360,320L360,320L240,320L240,320L120,320L120,320L0,320L0,320Z"
        ></path>
      </svg>
      <FootNavbar />
      {isTapped && <MobileMenu />}
    </div>
  );
};

export default index;
