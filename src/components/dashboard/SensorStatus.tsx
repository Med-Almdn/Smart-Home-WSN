import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Thermometer, Droplets, Wind, Radio, Sun, DoorOpen } from 'lucide-react';

const SensorStatus: React.FC = () => {
  const { sensors } = useNetwork();
  
  // Group sensors by type
  const sensorsByType = sensors.reduce<Record<string, typeof sensors>>((acc, sensor) => {
    if (!acc[sensor.type]) {
      acc[sensor.type] = [];
    }
    acc[sensor.type].push(sensor);
    return acc;
  }, {});
  
  const iconMap: Record<string, React.ReactNode> = {
    temperature: <Thermometer className="w-5 h-5 text-red-500" />,
    humidity: <Droplets className="w-5 h-5 text-blue-500" />,
    gas: <Wind className="w-5 h-5 text-purple-500" />,
    motion: <Radio className="w-5 h-5 text-amber-500" />,
    light: <Sun className="w-5 h-5 text-yellow-500" />,
    door: <DoorOpen className="w-5 h-5 text-green-500" />
  };
  
  const unitMap: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    gas: 'ppm',
    motion: 'events',
    light: 'lux',
    door: ''
  };
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Object.entries(sensorsByType).map(([type, typeSensors]) => {
        const activeSensors = typeSensors.filter(s => s.active).length;
        
        // Calculate an average for numeric values
        let avgValue = 0;
        let formattedValue = '';
        
        if (['temperature', 'humidity', 'gas', 'light'].includes(type)) {
          avgValue = typeSensors.reduce((sum, s) => sum + (s.value as number), 0) / typeSensors.length;
          formattedValue = `${avgValue.toFixed(1)} ${unitMap[type]}`;
        } else if (type === 'motion') {
          const events = typeSensors.filter(s => s.active && (s.value as boolean)).length;
          formattedValue = `${events} active`;
        } else if (type === 'door') {
          const open = typeSensors.filter(s => s.active && (s.value as boolean)).length;
          formattedValue = `${open} open`;
        }
        
        return (
          <div key={type} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 mr-3 bg-white rounded-md">
              {iconMap[type]}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium capitalize">{type} Sensors</h3>
                <span className="text-xs text-gray-500">{activeSensors}/{typeSensors.length} active</span>
              </div>
              <p className="text-lg font-semibold">{formattedValue}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SensorStatus;