import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { migrateFromLocalStorage } from './utils/migrateNotes';
import Landing from './pages/Landing';
import StudyList from './pages/StudyList';
import Viewer from './pages/Viewer';
import Quiz from './pages/Quiz';

function App() {
  useEffect(() => {
    // 앱 시작 시 한 번만 마이그레이션
    migrateFromLocalStorage();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/study-list" element={<StudyList />} />
        <Route path="/viewer/:id" element={<Viewer />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;
