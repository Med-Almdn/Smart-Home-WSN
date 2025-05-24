import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCw, ZoomIn, ZoomOut, Play, Pause, Sliders, 
  PlusCircle, MinusCircle, RefreshCw
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';
import NetworkVisualization from '../components/network/NetworkVisualization';

const NetworkSimulation: React.FC = () => {
  const { network, runSimulation, resetSimulation, setNodeCount, toggleSimulation, isSimulationRunning } = useNetwork();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('leach');
  const [clusterRadius, setClusterRadius] = useState(100);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Configuration options
  const [numNodes, setNumNodes] = useState(network.nodes.length);
  const [chPercentage, setChPercentage] = useState(0.1); // 10% cluster heads
  const [energyThreshold, setEnergyThreshold] = useState(30); // Below 30% triggers CH rotation
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleApplySettings = () => {
    setNodeCount(numNodes);
    setShowSettings(false);
  };

  const handleRotateClusterHeads = () => {
    // Logic to rotate cluster heads based on energy levels
    runSimulation('rotateClusterHeads');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Network Simulation</h1>
        <div className="flex flex-wrap items-center mt-4 space-x-2 md:mt-0">
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={toggleSimulation}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run</span>
              </>
            )}
          </button>
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={resetSimulation}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={handleRotateClusterHeads}
          >
            <RotateCw className="w-4 h-4" />
            <span>Rotate CHs</span>
          </button>
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={handleToggleSettings}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow lg:col-span-3">
          <div className="relative h-[600px] border border-gray-200 rounded-lg overflow-hidden">
            <NetworkVisualization zoomLevel={zoomLevel} />
            
            <div className="absolute flex flex-col p-2 space-y-2 bg-white rounded-md shadow top-4 right-4">
              <button className="p-1 hover:bg-gray-100 rounded-md" onClick={handleZoomIn}>
                <ZoomIn className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded-md" onClick={handleZoomOut}>
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-medium">Network Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Nodes</p>
                <p className="text-lg font-medium">{network.nodes.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Nodes</p>
                <p className="text-lg font-medium">{network.nodes.filter(n => n.active).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cluster Heads</p>
                <p className="text-lg font-medium">{network.nodes.filter(n => n.isClusterHead).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Energy Level</p>
                <p className="text-lg font-medium">
                  {Math.round(network.nodes.reduce((acc, node) => acc + node.battery, 0) / network.nodes.length)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Messages Transmitted</p>
                <p className="text-lg font-medium">{network.messagesTransmitted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Energy Consumed</p>
                <p className="text-lg font-medium">{network.totalEnergyConsumed.toFixed(2)} mAh</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-medium">Protocol Info</h3>
            <div className="mb-4">
              <div className="flex mb-2 text-sm">
                <button
                  className={`flex-1 py-2 ${activeTab === 'leach' ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-gray-50'} border border-gray-200`}
                  onClick={() => setActiveTab('leach')}
                >
                  LEACH
                </button>
                <button
                  className={`flex-1 py-2 ${activeTab === 'multi' ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-gray-50'} border border-gray-200`}
                  onClick={() => setActiveTab('multi')}
                >
                  Multi-hop
                </button>
              </div>
              
              {activeTab === 'leach' && (
                <div className="p-3 text-sm bg-gray-50 rounded-md">
                  <p className="mb-2">
                    <strong>LEACH:</strong> Low Energy Adaptive Clustering Hierarchy
                  </p>
                  <p className="mb-2">
                    Self-organizing protocol that distributes energy load among sensors by 
                    randomly rotating cluster heads.
                  </p>
                  <p>
                    Current CH Rotation: Based on energy threshold of {energyThreshold}%
                  </p>
                </div>
              )}
              
              {activeTab === 'multi' && (
                <div className="p-3 text-sm bg-gray-50 rounded-md">
                  <p className="mb-2">
                    <strong>Multi-hop LEACH:</strong> Enhanced LEACH with multi-hop routing
                  </p>
                  <p className="mb-2">
                    Reduces transmission distance by using intermediate nodes as relays
                    to conserve energy.
                  </p>
                  <p>
                    Current Hop Limit: 2 hops maximum
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-medium">Simulation Settings</h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Number of Nodes</label>
              <div className="flex items-center">
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setNumNodes(prev => Math.max(prev - 1, 5))}
                >
                  <MinusCircle size={16} />
                </button>
                <input
                  type="number"
                  className="w-full p-2 mx-2 text-center border border-gray-300 rounded-md"
                  value={numNodes}
                  onChange={(e) => setNumNodes(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
                  min="5"
                  max="50"
                />
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setNumNodes(prev => Math.min(prev + 1, 50))}
                >
                  <PlusCircle size={16} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">CH Percentage (%)</label>
              <input
                type="range"
                className="w-full"
                min="5"
                max="30"
                step="5"
                value={chPercentage * 100}
                onChange={(e) => setChPercentage(parseInt(e.target.value) / 100)}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5%</span>
                <span>30%</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">Current: {chPercentage * 100}%</p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Energy Threshold for CH Rotation (%)</label>
              <input
                type="range"
                className="w-full"
                min="10"
                max="50"
                step="5"
                value={energyThreshold}
                onChange={(e) => setEnergyThreshold(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>50%</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">Current: {energyThreshold}%</p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Animation Speed</label>
              <input
                type="range"
                className="w-full"
                min="0.5"
                max="2"
                step="0.5"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={handleApplySettings}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSimulation;