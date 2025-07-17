import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Login />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
