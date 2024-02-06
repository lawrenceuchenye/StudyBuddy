import { FC } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp/";
import Login from "./pages/Login/";
import Dashboard from "./pages/Dashboard/";
import DashboardGoals from "./pages/DashboardGoals/";
import DashboardFindBuddies from "./pages/DashboardFindBuddies/";
import DashboardTutor from "./pages/DashboardTutor/";

import SharedLayout from "./pages/SharedLayout/";

const App: FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<SharedLayout />}>
            <Route path="" element={<Home />} />
            <Route path="signup/" element={<SignUp />} />
            <Route path="login/" element={<Login />} />
            <Route path="dashboard/" element={<Dashboard />} />
            <Route path="dashboard/goals/" element={<DashboardGoals />} />
            <Route
              path="dashboard/find-match-buddies/"
              element={<DashboardFindBuddies />}
            />
            <Route path="dashboard/tutor/" element={<DashboardTutor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
