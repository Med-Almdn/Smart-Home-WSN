import React from 'react';

interface SensorDataTableProps {
  sensors: any[];
  sensorType: string;
}

const SensorDataTable: React.FC<SensorDataTableProps> = ({ sensors, sensorType }) => {
  // Generate unit based on sensor type
  const unitMap: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    gas: 'ppm',
    motion: '',
    light: 'lux',
    door: ''
  };
  
  const unit = unitMap[sensorType] || '';
  
  const formatValue = (sensor: any) => {
    if (sensorType === 'motion') {
      return sensor.value ? 'Motion Detected' : 'No Motion';
    } else if (sensorType === 'door') {
      return sensor.value ? 'Open' : 'Closed';
    } else {
      return `${sensor.value} ${unit}`;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Value
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Last Update
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Battery
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sensors.map((sensor) => (
            <tr key={sensor.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Sensor {sensor.id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{sensor.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatValue(sensor)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                  sensor.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {sensor.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(sensor.lastUpdate).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      sensor.battery < 20 ? 'bg-red-500' : 
                      sensor.battery < 50 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${sensor.battery}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">{sensor.battery}%</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SensorDataTable;