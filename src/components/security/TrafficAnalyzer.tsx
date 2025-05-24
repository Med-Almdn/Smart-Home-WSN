import React, { useState, useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { AlertTriangle, Search, ArrowUpDown, Filter, Download } from 'lucide-react';

const TrafficAnalyzer: React.FC = () => {
  const { network, generateNetworkTraffic } = useNetwork();
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Generate initial traffic data
    const initialData = generateNetworkTraffic(15);
    setTrafficData(initialData);
    
    // Generate sample anomalies
    const sampleAnomalies = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        type: 'excessive_traffic',
        source: 'Node 7',
        destination: 'Base Station',
        severity: 'medium',
        details: 'Unusual traffic volume detected',
        status: 'open'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        type: 'authentication_failure',
        source: '192.168.1.105',
        destination: 'MQTT Broker',
        severity: 'high',
        details: 'Multiple failed authentication attempts',
        status: 'investigating'
      }
    ];
    setAnomalies(sampleAnomalies);
    
    // Add new traffic periodically
    const interval = setInterval(() => {
      const newTraffic = generateNetworkTraffic(1)[0];
      setTrafficData(prev => [newTraffic, ...prev].slice(0, 100)); // Keep only last 100 items
    }, 3000);
    
    return () => clearInterval(interval);
  }, [generateNetworkTraffic]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Handle DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Draw traffic visualization
    const padding = 30;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
    
    // Generate data for different message types
    const timeRange = 10 * 60 * 1000; // 10 minutes in ms
    const now = Date.now();
    const dataPoints = 100;
    
    const sensorData = new Array(dataPoints).fill(0);
    const controlData = new Array(dataPoints).fill(0);
    const errorData = new Array(dataPoints).fill(0);
    
    // Count messages by type and time bucket
    trafficData.forEach(message => {
      const messageTime = new Date(message.timestamp).getTime();
      const timeDiff = now - messageTime;
      
      if (timeDiff <= timeRange) {
        const index = Math.floor((timeDiff / timeRange) * dataPoints);
        const bucketIndex = dataPoints - 1 - index;
        
        if (bucketIndex >= 0) {
          if (message.type === 'sensor_data') {
            sensorData[bucketIndex] += 1;
          } else if (message.type === 'control') {
            controlData[bucketIndex] += 1;
          } else if (message.type === 'error') {
            errorData[bucketIndex] += 2; // Make errors more visible
          }
        }
      }
    });
    
    // Draw data
    const maxValue = Math.max(
      ...sensorData,
      ...controlData,
      ...errorData
    );
    
    // Draw y-axis ticks and labels
    const yTickCount = 5;
    for (let i = 0; i < yTickCount; i++) {
      const y = padding + (chartHeight / (yTickCount - 1)) * i;
      const value = maxValue - (maxValue / (yTickCount - 1)) * i;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();
      
      // Draw grid line
      ctx.strokeStyle = '#F3F4F6';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      ctx.strokeStyle = '#E5E7EB';
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toFixed(0), padding - 8, y);
    }
    
    // Draw x-axis labels
    const xLabelCount = 5;
    for (let i = 0; i < xLabelCount; i++) {
      const x = padding + (chartWidth / (xLabelCount - 1)) * i;
      const minutes = (10 / (xLabelCount - 1)) * (xLabelCount - 1 - i);
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, padding + chartHeight);
      ctx.lineTo(x, padding + chartHeight + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${minutes.toFixed(0)}m ago`, x, padding + chartHeight + 8);
    }
    
    // Draw sensor data line
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i;
      const y = padding + chartHeight - (chartHeight * sensorData[i]) / (maxValue || 1);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw control data line
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i;
      const y = padding + chartHeight - (chartHeight * controlData[i]) / (maxValue || 1);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw error data line
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i;
      const y = padding + chartHeight - (chartHeight * errorData[i]) / (maxValue || 1);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw anomalies as markers
    anomalies.forEach(anomaly => {
      const anomalyTime = new Date(anomaly.timestamp).getTime();
      const timeDiff = now - anomalyTime;
      
      if (timeDiff <= timeRange) {
        const position = (timeDiff / timeRange);
        const x = padding + chartWidth * (1 - position);
        
        ctx.fillStyle = anomaly.severity === 'high' ? '#EF4444' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(x, padding + 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, padding + 15);
      }
    });
    
    // Draw legend
    const legendY = rect.height - 15;
    
    // Sensor data
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, legendY);
    ctx.lineTo(padding + 20, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1F2937';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sensor Data', padding + 25, legendY);
    
    // Control messages
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding + 100, legendY);
    ctx.lineTo(padding + 120, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'left';
    ctx.fillText('Control Messages', padding + 125, legendY);
    
    // Error messages
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding + 230, legendY);
    ctx.lineTo(padding + 250, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'left';
    ctx.fillText('Errors', padding + 255, legendY);
    
  }, [trafficData, anomalies]);
  
  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      // Add a new anomaly
      const newAnomaly = {
        id: anomalies.length + 1,
        timestamp: new Date().toISOString(),
        type: 'unusual_pattern',
        source: 'Node 3',
        destination: 'Cluster Head 1',
        severity: 'low',
        details: 'Unexpected message frequency detected',
        status: 'new'
      };
      
      setAnomalies(prev => [newAnomaly, ...prev]);
      setIsAnalyzing(false);
    }, 3000);
  };
  
  const filteredTraffic = trafficData.filter(msg => {
    // Apply type filter
    if (filter !== 'all' && msg.type !== filter) return false;
    
    // Apply search term to source, destination or message
    if (searchTerm && !msg.source.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !msg.destination.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !msg.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
        <h3 className="text-sm font-medium text-blue-800">Network Traffic Analysis</h3>
        <p className="mt-1 text-sm text-blue-600">
          Monitor network traffic patterns and detect anomalies to ensure network security.
        </p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Traffic Visualization</h3>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isAnalyzing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Anomaly Detection'}
          </button>
        </div>
        
        <div className="h-80 border border-gray-200 rounded-lg">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {anomalies.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Detected Anomalies</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anomalies.map((anomaly) => (
                  <tr key={anomaly.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(anomaly.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{anomaly.type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{anomaly.source}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        anomaly.severity === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : anomaly.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        anomaly.status === 'new' 
                          ? 'bg-blue-100 text-blue-800' 
                          : anomaly.status === 'open' || anomaly.status === 'investigating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {anomaly.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {anomaly.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Traffic Log</h3>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="sensor_data">Sensor Data</option>
              <option value="control">Control Messages</option>
              <option value="error">Errors</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTraffic.slice(0, 10).map((message, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      message.type === 'sensor_data' 
                        ? 'bg-blue-100 text-blue-800' 
                        : message.type === 'control'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {message.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {message.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {message.destination}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {message.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTraffic.length > 10 && (
          <div className="py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">10</span> of <span className="font-medium">{filteredTraffic.length}</span> messages
            </div>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              View more
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Anomaly Detection Algorithms</h3>
        
        <div className="space-y-4">
          <div className="p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-md">
            <h4 className="text-sm font-medium text-blue-800">Statistical Pattern Analysis</h4>
            <p className="mt-1 text-sm text-blue-700">
              Detects anomalies by analyzing statistical properties of network traffic, such as mean, standard deviation, and higher-order moments.
            </p>
          </div>
          
          <div className="p-3 border-l-4 border-green-400 bg-green-50 rounded-r-md">
            <h4 className="text-sm font-medium text-green-800">Machine Learning Classification</h4>
            <p className="mt-1 text-sm text-green-700">
              Uses supervised machine learning to classify traffic patterns as normal or anomalous based on historical data.
            </p>
          </div>
          
          <div className="p-3 border-l-4 border-purple-400 bg-purple-50 rounded-r-md">
            <h4 className="text-sm font-medium text-purple-800">Time Series Analysis</h4>
            <p className="mt-1 text-sm text-purple-700">
              Analyzes temporal patterns in network traffic to identify deviations from expected behavior over time.
            </p>
          </div>
          
          <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-md">
            <h4 className="text-sm font-medium text-yellow-800">Rule-Based Detection</h4>
            <p className="mt-1 text-sm text-yellow-700">
              Applies predefined rules and thresholds to detect specific types of attacks or abnormal behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalyzer;