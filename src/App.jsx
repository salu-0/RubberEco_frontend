// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Features from './pages/Features';
import Training from './pages/Training';
import TrainingModule from './pages/TrainingModule';
import TrainingPaymentSuccess from './pages/TrainingPaymentSuccess';
import Markets from './pages/Markets';

import Pricing from './pages/Pricing';
import Nursery from './pages/Nursery';
import NurseryCenter from './pages/NurseryCenter';
import About from './pages/About';
import Careers from './pages/Careers';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BrokerRegister from './components/Auth/BrokerRegister';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import BidPage from './pages/BidPage';
import Profile from './pages/Profile';
import JoinAsStaff from './pages/JoinAsStaff';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthCallback from './components/Auth/AuthCallback';
import VerifySuccess from './pages/VerifySuccess';
import Toast from './components/Toast';
// import CertificateVerification from './pages/CertificateVerification';

function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/features" element={<ProtectedRoute requiredRole="farmer"><Features /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute requiredRole="farmer"><Training /></ProtectedRoute>} />
      <Route path="/training/:moduleId" element={<ProtectedRoute requiredRole="farmer"><TrainingModule /></ProtectedRoute>} />
      <Route path="/training-payment-success" element={<ProtectedRoute requiredRole="farmer"><TrainingPaymentSuccess /></ProtectedRoute>} />
      {/* <Route path="/certificate-verification" element={<CertificateVerification />} /> */}
      <Route path="/markets" element={<ProtectedRoute requiredRole="farmer"><Markets /></ProtectedRoute>} />

      <Route path="/pricing" element={<ProtectedRoute requiredRole="farmer"><Pricing /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute requiredRole="farmer"><About /></ProtectedRoute>} />
      <Route path="/nursery" element={<ProtectedRoute requiredRole="farmer"><Nursery /></ProtectedRoute>} />
      <Route path="/nursery/:centerId" element={<ProtectedRoute requiredRole="farmer"><NurseryCenter /></ProtectedRoute>} />
      <Route path="/careers" element={<ProtectedRoute requiredRole="farmer"><Careers /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-broker" element={<BrokerRegister />} />
      <Route path="/join-as-staff" element={<JoinAsStaff />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-success" element={<VerifySuccess />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/staff-dashboard" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
      <Route path="/broker-dashboard" element={<ProtectedRoute><BrokerDashboard /></ProtectedRoute>} />
      <Route path="/bid/:lotId" element={<ProtectedRoute><BidPage /></ProtectedRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;