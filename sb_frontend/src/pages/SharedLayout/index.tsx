import "./index.css";
import React, { FC } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../../components/Navbar/";

const index: FC = () => {
  return (
    <div>
    <Navbar />
      <section>
        <Outlet />
      </section>
    </div>
  );
};

export default index;
