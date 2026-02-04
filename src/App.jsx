import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GovernanceSection from './components/GovernanceSection';
import EthicsSection from './components/EthicsSection';
import UseCasesSection from './components/UseCasesSection';
import { MonitoringSection } from './components/MonitoringSection';
import ParticipationSection from './components/ParticipationSection';
import ResourcesSection from './components/ResourcesSection';
import DspaceList from './components/DspaceList';
import HeroSection from './components/HeroSection';
import BodySection from './components/BodySection';
import InteractiveMap from './components/InteractiveMap';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import Login from './components/Login';     
import ProtectedRoute from './components/ProtectedRoute'; 
import { ecuadorProvinces } from './data/ecuadorProvinces';

function App() {
  const [provinceData, setProvinceData] = useState(ecuadorProvinces);

  const updateProvinceData = (provinceName, newValue) => {
    setProvinceData((prevData) =>
      prevData.map((province) =>
        province.name === provinceName
          ? { ...province, aiInterest: newValue }
          : province
      )
    );
  };

  return (
    <Router>  {/* Sin basename por ahora */}
      <div className="font-sans">
        <Header />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={
            <>
              <HeroSection />
              <BodySection />
              <InteractiveMap provinceData={provinceData} updateProvinceData={updateProvinceData} />
            </>
          } />
          <Route path="/governance" element={<GovernanceSection />} />
          <Route path="/ethics" element={<EthicsSection />} />
          <Route path="/dspace" element={<DspaceList />} />
          <Route path="/use-cases" element={<UseCasesSection />} />
          <Route path="/monitoring" element={<MonitoringSection />} />
          <Route path="/participation" element={<ParticipationSection />} />
          <Route path="/resources" element={<ResourcesSection />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas (requieren login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;