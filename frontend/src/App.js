import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import FindRoom from './pages/FindRoom';
import RoomDetails from './pages/RoomDetails';
import PostRoom from './pages/PostRoom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import LoginWithOTP from './pages/LoginWithOTP';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/find-room" element={<FindRoom />} />
              <Route path="/room/:id" element={<RoomDetails />} />
              <Route path="/post-room" element={<ProtectedRoute><PostRoom /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/login-otp" element={<LoginWithOTP />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
