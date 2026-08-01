import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import UseCasesSection from './components/UseCasesSection';
import { MonitoringSection } from './components/MonitoringSection';
import ParticipationSection from './components/ParticipationSection';
import ResourcesSection from './components/ResourcesSection';
import DspaceList from './components/DspaceList';
import Home from './components/Home';
import BodySection from './components/BodySection';
import InteractiveMap from './components/InteractiveMap';
import AdminDashboard, {
  AdminDashboardOverview,
  AdminDashboardPublications,
  AdminDashboardResources,
  AdminDashboardIdeas,
} from './components/AdminDashboard';
import Header from './components/Header';
import Login from './components/Login';     
import ProtectedRoute from './components/ProtectedRoute'; 

const PublicLayout = () => (
  <div className="font-sans">
    <Header />
    <Outlet />
  </div>
);

function App() {
  return (
    <Router>  {/* Sin basename por ahora */}
      <Routes>
        {/* Rutas públicas con el header del sitio */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dspace" element={<DspaceList />} />
          <Route path="/monitoring" element={<MonitoringSection />} />
          <Route path="/participation" element={<ParticipationSection />} />
          <Route path="/resources" element={<ResourcesSection />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Panel de administración (solo admin, sin header del sitio) */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminDashboardOverview />} />
            <Route path="publicaciones" element={<AdminDashboardPublications />} />
            <Route path="recursos" element={<AdminDashboardResources />} />
            <Route path="ideas" element={<AdminDashboardIdeas />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;