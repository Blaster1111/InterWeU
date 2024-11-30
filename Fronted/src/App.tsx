import React from 'react';
import JobPortalDashboard from './pages/dashbord';
import EmployerDashboard from './pages/jobposting';
import { EmployerSignin } from './pages/employeeAuth';
import { EmployerSignup } from './pages/employeeAuth';
import Signin from './pages/signin';
import Signup from './pages/signup';
import { useAuthContext } from './context/authContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext'; // Make sure this is imported

import './App.css';

function App() {
  // Remove the useAuthContext here from App to avoid premature context consumption
  return (
    <AuthContextProvider> {/* Wrap the entire app with the provider */}
      <Router>
        <Routes>
          {/* Signin & Signup Routes with Redirect if Already Authenticated */}
          <Route path="/signin" element={<SigninRedirect />} />
          <Route path="/signup" element={<SignupRedirect />} />

          {/* Main Dashboard Route */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Employer Routes */}
          <Route path="/employer/signin" element={<EmployerSignin />} />
          <Route path="/employer/signup" element={<EmployerSignup />} />
          <Route
            path="/employer/dashboard"
            element={<EmployerDashboardRedirect />}
          />
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

// Custom components to handle conditional rendering and redirection
function SigninRedirect() {
  const { authUser } = useAuthContext();
  return authUser ? <Navigate to="/dashboard" /> : <Signin />;
}

function SignupRedirect() {
  const { authUser } = useAuthContext();
  return authUser ? <Navigate to="/dashboard" /> : <Signup />;
}

function DashboardRedirect() {
  const { authUser } = useAuthContext();
  return authUser ? <JobPortalDashboard /> : <Navigate to="/signin" />;
}

function EmployerDashboardRedirect() {
  const { authUser } = useAuthContext();
  return authUser ? <EmployerDashboard /> : <Navigate to="/employer/signin" />;
}

export default App;
