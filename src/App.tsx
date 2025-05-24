
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NetworkSimulation from './pages/NetworkSimulation';
import SensorData from './pages/SensorData';
import EnergyAnalysis from './pages/EnergyAnalysis';
import Security from './pages/Security';
import { NetworkProvider } from './context/NetworkContext';

function App() {
  return (
    <Router>
      <NetworkProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/network" element={<NetworkSimulation />} />
            <Route path="/sensors" element={<SensorData />} />
            <Route path="/energy" element={<EnergyAnalysis />} />
            <Route path="/security" element={<Security />} />
          </Routes>
        </Layout>
      </NetworkProvider>
    </Router>
  );
}

export default App;