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
import DoctorDashboard from './pages/doctor/Dashboard';
import MyPatients from './pages/doctor/MyPatients';
import ViewPatientRecords from './pages/doctor/ViewPatientRecords';
import DoctorNotifications from './pages/doctor/Notifications';
import DoctorMyProfile from './pages/doctor/MyProfile';

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
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<MyPatients />} />
        <Route path="/doctor/patients/:patientId/records" element={<ViewPatientRecords />} />
        <Route path="/doctor/notifications" element={<DoctorNotifications />} />
        <Route path="/doctor/profile" element={<DoctorMyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;