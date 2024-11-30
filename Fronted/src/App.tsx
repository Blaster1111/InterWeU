import React from 'react'; 
import JobPortalDashboard from './pages/dashbord'; 
import EmployerDashboard from './pages/jobposting'; 
import { EmployerSignin } from './pages/employeeAuth'; 
import { EmployerSignup } from './pages/employeeAuth'; 
import Signin from './pages/signin'; 
import Signup from './pages/signup'; 
import { useAuthContext } from './context/authContext'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 
import { AuthContextProvider } from './context/authContext';  
import './App.css';  

function App() {   
  return (     
    <AuthContextProvider>       
      <Router>         
        <Routes>           
          {/* Student/General Routes */}           
          <Route path="/signin" element={<SigninRedirect />} />           
          <Route path="/signup" element={<SignupRedirect />} />           
          <Route path="/dashboard" element={<DashboardRedirect />} />            

          {/* Employer/Employee Routes */}           
          <Route path="/employee/signin" element={<EmployerSigninRedirect />} />           
          <Route path="/employee/signup" element={<EmployerSignupRedirect />} />           
          <Route path="/employee/dashboard" element={<EmployerDashboardRedirect />} />            

          {/* Default/Root Redirect */}           
          <Route path="/" element={<Navigate to="/signin" />} />         
        </Routes>       
      </Router>     
    </AuthContextProvider>   
  ); 
}  

// Redirect Components
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

function EmployerSigninRedirect() {   
  const { authUser } = useAuthContext();   
  return authUser ? <Navigate to="/employee/dashboard" /> : <EmployerSignin />; 
}  

function EmployerSignupRedirect() {   
  const { authUser } = useAuthContext();   
  return authUser ? <Navigate to="/employee/dashboard" /> : <EmployerSignup />; 
}  

function EmployerDashboardRedirect() {   
  const { authUser } = useAuthContext();   
  return authUser ? <EmployerDashboard /> : <Navigate to="/employee/signin" />; 
}  

export default App;