import { useState } from 'react';
import { ecuadorProvinces } from './data/ecuadorProvinces';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GovernanceSection from './components/GovernanceSection';
import EthicsSection from './components/EthicsSection';
import UseCasesSection from './components/UseCasesSection';
import { MonitoringSection } from './components/MonitoringSection';
import ParticipationSection from './components/ParticipationSection';
import ResourcesSection from './components/ResourcesSection';
import HeroSection from './components/HeroSection';
import BodySection from './components/BodySection';
import InteractiveMap from './components/InteractiveMap';
import Header from './components/Header';


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
    <Router>
      <div className="font-sans">
        {/* Navigation Menu */}
        <Header />

        {/* Routes */}
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <BodySection />
              <InteractiveMap provinceData={provinceData} updateProvinceData={updateProvinceData} />
            </>
          } />
          <Route path="/governance" element={<GovernanceSection />} />
          <Route path="/ethics" element={<EthicsSection />} />
          <Route path="/use-cases" element={<UseCasesSection />} />
          <Route path="/monitoring" element={<MonitoringSection />} />
          <Route path="/participation" element={<ParticipationSection />} />
          <Route path="/resources" element={<ResourcesSection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
