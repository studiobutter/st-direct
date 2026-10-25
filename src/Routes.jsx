import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Main Page
import Home from './pages/home';
import Status from './pages/status';
import EventRedirect from './pages/event';

import NotFound from './components/NotFound';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event" element={<EventRedirect />} />
        <Route path="/status" element={<Status />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
