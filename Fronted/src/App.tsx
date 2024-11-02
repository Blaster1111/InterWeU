import JobPortalDashboard  from './pages/dashbord'
import EmployerDashboard   from  './pages/jobposting'
import Signin  from './pages/signin';
import Signup from './pages/signup';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import './App.css'

function App() {
  

  return (
    <>
      
      <Router>
      <Routes>
        {/* Sign up */}
        <Route path="/signin" element={<Signin></Signin>} />
        
        <Route path="/signup" element={<Signup></Signup>} />
        {/* Main Dashboard Route */}
        <Route path="/dashboard" element={<JobPortalDashboard></JobPortalDashboard>} />

        {/* Additional Routes for Tabs */}
        <Route path="/job-postings" element={<EmployerDashboard />} />
       
      </Routes>
    </Router>
      
    </>
  )
}

export default App
