import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import StudyList from "./pages/StudyList.jsx";
import Viewer from "./pages/Viewer.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/study-list" element={<StudyList />} />
        <Route path="/viewer/:id" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
