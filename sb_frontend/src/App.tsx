import { FC } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import SharedLayout from "./pages/SharedLayout/";

const App: FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<SharedLayout />}>
            <Route path="" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
