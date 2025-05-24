import React, { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { Download, RefreshCw, BarChart3, PieChart } from 'lucide-react';
import EnergyConsumptionChart from '../components/energy/EnergyConsumptionChart';
import BatteryLevelChart from '../components/energy/BatteryLevelChart';
import EnergyDistributionChart from '../components/energy/EnergyDistributionChart';
import ClusterHeadEnergyComparison from '../components/energy/ClusterHeadEnergyComparison';

const EnergyAnalysis: React.FC = () => {
  const { network, nodes, runSimulation } = useNetwork();
  const [timeRange, setTimeRange] = useState('1h');
  const [showPredictions, setShowPredictions] = useState(false);
  const [activeChart, setActiveChart] = useState('consumption');

  const lowBatteryNodes = network.nodes.filter(node => node.battery < 30);
  const avgConsumptionRate = network.nodes.reduce((acc, node) => acc + node.energyConsumptionRate, 0) / network.nodes.length;
  
  const estimatedNetworkLifetime = Math.floor(
    (network.nodes.reduce((acc, node) => acc + node.battery, 0) / network.nodes.length) / 
    (avgConsumptionRate * 24)
  );

  const handleExportData = () => {
    alert('Energy data export functionality would be implemented here');
  };

  const handleRunPrediction = () => {
    setShowPredictions(true);
    runSimulation('predictEnergy');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Energy Analysis</h1>
        <div className="flex flex-wrap items-center mt-4 space-x-2 md:mt-0">
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={handleRunPrediction}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Run Prediction</span>
          </button>
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Avg. Battery Level</p>
          <p className="text-2xl font-semibold text-gray-800">
            {Math.round(network.nodes.reduce((acc, node) => acc + node.battery, 0) / network.nodes.length)}%
          </p>
          <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-red-500 to-green-500" 
              style={{ width: `${Math.round(network.nodes.reduce((acc, node) => acc + node.battery, 0) / network.nodes.length)}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Nodes with Low Battery</p>
          <p className="text-2xl font-semibold text-gray-800">{lowBatteryNodes.length}</p>
          <p className="mt-2 text-sm text-gray-600">
            {lowBatteryNodes.length > 0 ? 
              `${Math.round(lowBatteryNodes.length / network.nodes.length * 100)}% of network` : 
              'All nodes healthy'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Avg Energy Consumption</p>
          <p className="text-2xl font-semibold text-gray-800">{avgConsumptionRate.toFixed(2)} mAh/h</p>
          <p className="mt-2 text-sm text-gray-600">
            {avgConsumptionRate > 1 ? 'High consumption rate' : 'Efficient operation'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Est. Network Lifetime</p>
          <p className="text-2xl font-semibold text-gray-800">{estimatedNetworkLifetime} days</p>
          <p className="mt-2 text-sm text-gray-600">
            Based on current consumption rate
          </p>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Energy Visualization</h3>
          <div className="flex space-x-2">
            <select
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap mb-4 space-x-2">
          <button
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              activeChart === 'consumption'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveChart('consumption')}
          >
            Energy Consumption
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              activeChart === 'battery'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveChart('battery')}
          >
            Battery Levels
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              activeChart === 'distribution'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveChart('distribution')}
          >
            Energy Distribution
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              activeChart === 'clusterhead'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveChart('clusterhead')}
          >
            CH Comparison
          </button>
        </div>

        <div className="h-80">
          {activeChart === 'consumption' && (
            <EnergyConsumptionChart 
              timeRange={timeRange}
              showPredictions={showPredictions}
            />
          )}
          {activeChart === 'battery' && (
            <BatteryLevelChart 
              timeRange={timeRange}
              showPredictions={showPredictions}
            />
          )}
          {activeChart === 'distribution' && (
            <EnergyDistributionChart />
          )}
          {activeChart === 'clusterhead' && (
            <ClusterHeadEnergyComparison />
          )}
        </div>
      </div>

      {/* Energy Optimization Recommendations */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium">Energy Optimization Recommendations</h3>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-md">
            <h4 className="font-medium text-green-800">Sleep Schedule Optimization</h4>
            <p className="text-sm text-green-700">
              Implementing a more aggressive sleep schedule for nodes in cluster 2 could reduce energy consumption by up to 15%.
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md">
            <h4 className="font-medium text-blue-800">Cluster Head Rotation</h4>
            <p className="text-sm text-blue-700">
              Increasing cluster head rotation frequency from the current 24h to 12h would balance energy consumption more evenly.
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
            <h4 className="font-medium text-yellow-800">Transmission Power Adjustment</h4>
            <p className="text-sm text-yellow-700">
              Nodes 3, 7, and 12 are using excessive transmission power. Reducing their power levels would extend battery life by ~20%.
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded-md">
            <h4 className="font-medium text-purple-800">Data Aggregation Improvement</h4>
            <p className="text-sm text-purple-700">
              Implementing temporal data aggregation at cluster heads would reduce message count by approximately 35%.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Energy Protocols Comparison</h3>
          <p className="mt-1 text-sm text-gray-500">Comparing different routing protocols for energy efficiency</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Protocol
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Avg. Energy Use
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Network Lifetime
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Delivery Rate
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Latency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">LEACH</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">0.8 mAh/h</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">45 days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">97%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">120ms</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Multi-Hop LEACH</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">0.65 mAh/h</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">62 days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">95%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">180ms</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Direct Transmission</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">1.2 mAh/h</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">28 days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">99%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">85ms</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Static CH</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">0.95 mAh/h</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">35 days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">98%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">110ms</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalysis;