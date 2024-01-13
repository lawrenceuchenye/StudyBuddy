import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home/";
import SharedLayout from "./pages/SharedLayout//";

function App() {
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
}

export default App;
