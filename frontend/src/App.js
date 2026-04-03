import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/Dashboard';
import MedicalRecords from './pages/patient/MedicalRecords';
import UploadRecord from './pages/patient/UploadRecord';
import ConsentManagement from './pages/patient/ConsentManagement';
import Notifications from './pages/patient/Notifications';
import MyProfile from './pages/patient/MyProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/records" element={<MedicalRecords />} />
        <Route path="/patient/upload" element={<UploadRecord />} />
        <Route path="/patient/consent" element={<ConsentManagement />} />
        <Route path="/patient/notifications" element={<Notifications />} />
        <Route path="/patient/profile" element={<MyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;