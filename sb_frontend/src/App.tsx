import { FC } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp/";
import Login from "./pages/Login/";
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
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
