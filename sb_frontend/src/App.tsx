import { FC } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp/";
import Login from "./pages/Login/";
import Dashboard from "./pages/Dashboard/";
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
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
