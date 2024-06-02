import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/Home";
import Search from "./components/Search";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:id" element={<Search />} />
          <Route path="/search/:id" element={<Search />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
