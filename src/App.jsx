import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import Breadcrumb from './components/layout/Breadcrumb';
import AuthGate from './components/shared/AuthGate';

import { useState } from 'react';

import Landing from './pages/Landing';

import Login from './pages/auth/Login';
import CitizenRegister from './pages/auth/CitizenRegister';
import OfficerRegister from './pages/auth/OfficerRegister';
import CourtRegister from './pages/auth/CourtRegister';

import CitizenDashboard from './pages/citizen/CitizenDashboard';
import LogFIR from './pages/citizen/LogFIR';
import ViewFIRs from './pages/citizen/ViewFIRs';
import FIRDetail from './pages/citizen/FIRDetail';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import SmartSearch from './pages/officer/SmartSearch';
import MyCases from './pages/officer/MyCases';
import CaseDetail from './pages/officer/CaseDetail';
import ResourceUpload from './pages/officer/ResourceUpload';
import DataSharing from './pages/officer/DataSharing';
import AccessControl from './pages/officer/AccessControl';
import DepartmentChat from './pages/officer/DepartmentChat';
import AuditLog from './pages/officer/AuditLog';
import SecurityPanel from './pages/officer/SecurityPanel';

import CourtDashboard from './pages/court/CourtDashboard';
import CourtCaseDetail from './pages/court/CourtCaseDetail';
import ViewDocuments from './pages/court/ViewDocuments';
import AlertSettings from './pages/court/AlertSettings';
import Proceedings from './pages/court/Proceedings';


function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}


function CitizenLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}


function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">

          <Breadcrumb />

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-4 px-3 py-2 rounded-lg bg-white border border-navy-100 text-sm font-medium text-navy hover:bg-navy-50 transition-colors"
            aria-label="Open navigation menu"
          >
            ☰ Menu
          </button>

          <Outlet />

        </div>
      </main>
    </div>
  );
}


function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register/citizen"
          element={<CitizenRegister />}
        />

        <Route
          path="/register/officer"
          element={<OfficerRegister />}
        />

        {/* NEW: COURT REGISTRATION */}
        <Route
          path="/register/court"
          element={<CourtRegister />}
        />

      </Route>


      {/* CITIZEN ROUTES */}
      <Route element={<CitizenLayout />}>

        <Route
          path="/citizen"
          element={<CitizenDashboard />}
        />

        <Route
          path="/citizen/log-fir"
          element={<LogFIR />}
        />

        <Route
          path="/citizen/view-firs"
          element={<ViewFIRs />}
        />

        <Route
          path="/citizen/fir/:id"
          element={<FIRDetail />}
        />

      </Route>


      {/* OFFICER ROUTES */}
      <Route element={<DashboardLayout />}>

        <Route
          path="/officer"
          element={<OfficerDashboard />}
        />

        <Route
          path="/officer/search"
          element={<SmartSearch />}
        />

        <Route
          path="/officer/cases"
          element={<MyCases />}
        />

        <Route
          path="/officer/cases/:id"
          element={<CaseDetail />}
        />

        <Route
          path="/officer/upload"
          element={<ResourceUpload />}
        />

        <Route
          path="/officer/sharing"
          element={<DataSharing />}
        />

        <Route
          path="/officer/access"
          element={<AccessControl />}
        />

        <Route
          path="/officer/chat"
          element={<DepartmentChat />}
        />

        <Route
          path="/officer/audit"
          element={<AuditLog />}
        />

        <Route
          path="/officer/security"
          element={<SecurityPanel />}
        />

      </Route>


      {/* COURT ROUTES */}
      <Route element={<DashboardLayout />}>

        <Route
          path="/court"
          element={<CourtDashboard />}
        />

        <Route
          path="/court/cases/:id"
          element={<CourtCaseDetail />}
        />

        <Route
          path="/court/documents"
          element={<ViewDocuments />}
        />

        <Route
          path="/court/alerts"
          element={<AlertSettings />}
        />

        <Route
          path="/court/proceedings"
          element={<Proceedings />}
        />

      </Route>


      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


export default function App() {

  const [gateOpen, setGateOpen] = useState(() => {
    return sessionStorage.getItem('nyayasetu_verified') !== 'true';
  });


  const handleGateAuth = () => {
    sessionStorage.setItem(
      'nyayasetu_verified',
      'true'
    );

    setGateOpen(false);
  };


  return (
    <BrowserRouter>

      <LanguageProvider>

        <AuthProvider>

          {gateOpen && (
            <AuthGate
              onAuthenticated={handleGateAuth}
            />
          )}

          <AppRoutes />

        </AuthProvider>

      </LanguageProvider>

    </BrowserRouter>
  );
}