import React, { createContext, useContext, useState, useEffect } from 'react';

type Node = {
  id: number;
  x: number;
  y: number;
  isClusterHead: boolean;
  active: boolean;
  battery: number;
  clusterId: number | null;
  energyConsumptionRate: number;
};

type Sensor = {
  id: number;
  nodeId: number;
  type: string;
  value: number | boolean;
  location: string;
  active: boolean;
  battery: number;
  lastUpdate: string;
};

type NetworkState = {
  nodes: Node[];
  messagesTransmitted: number;
  totalEnergyConsumed: number;
};

interface NetworkContextType {
  network: NetworkState;
  sensors: Sensor[];
  simulationStep: number;
  isSimulationRunning: boolean;
  sensorData: any[];
  runSimulation: (action?: string) => void;
  resetSimulation: () => void;
  toggleSimulation: () => void;
  setNodeCount: (count: number) => void;
  refreshSensorData: () => void;
  generateMqttMessages: (sensorType: string, count: number) => any[];
  runSecurityCheck: () => void;
  encryptText: (text: string, key: string) => string;
  decryptText: (text: string, key: string) => string;
  generateNetworkTraffic: (count: number) => any[];
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [network, setNetwork] = useState<NetworkState>({
    nodes: [],
    messagesTransmitted: 0,
    totalEnergyConsumed: 0
  });
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationInterval, setSimulationIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  
  // Initialize network with random nodes
  useEffect(() => {
    initializeNetwork(20);
    initializeSensors();
  }, []);
  
  // Set up simulation interval
  useEffect(() => {
    if (isSimulationRunning) {
      const interval = setInterval(() => {
        runSimulation();
      }, 2000);
      
      setSimulationIntervalRef(interval);
      return () => clearInterval(interval);
    } else if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationIntervalRef(null);
    }
  }, [isSimulationRunning]);
  
  const initializeNetwork = (nodeCount: number) => {
    const nodes: Node[] = [];
    
    // Create random nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i + 1,
        x: Math.random(),
        y: Math.random(),
        isClusterHead: false,
        active: Math.random() > 0.1, // 90% of nodes are active
        battery: 50 + Math.floor(Math.random() * 50), // 50-100% battery
        clusterId: null,
        energyConsumptionRate: 0.5 + Math.random() * 1 // 0.5-1.5 mAh/h
      });
    }
    
    // Select some nodes as cluster heads (10%)
    const chCount = Math.max(1, Math.floor(nodeCount * 0.1));
    
    for (let i = 0; i < chCount; i++) {
      // Find a node with good battery level
      const candidates = nodes.filter(node => 
        node.active && node.battery > 70 && !node.isClusterHead
      );
      
      if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selectedNodeId = candidates[randomIndex].id;
        
        // Update node to be a cluster head
        const nodeIndex = nodes.findIndex(node => node.id === selectedNodeId);
        nodes[nodeIndex].isClusterHead = true;
        nodes[nodeIndex].energyConsumptionRate += 0.5; // Cluster heads use more energy
      }
    }
    
    // Assign regular nodes to cluster heads
    nodes.forEach(node => {
      if (!node.isClusterHead && node.active) {
        // Find the closest cluster head
        const clusterHeads = nodes.filter(n => n.isClusterHead);
        
        if (clusterHeads.length > 0) {
          let closestCH = clusterHeads[0];
          let minDistance = calculateDistance(node, closestCH);
          
          clusterHeads.forEach(ch => {
            const distance = calculateDistance(node, ch);
            if (distance < minDistance) {
              minDistance = distance;
              closestCH = ch;
            }
          });
          
          // Assign to closest cluster head
          const nodeIndex = nodes.findIndex(n => n.id === node.id);
          nodes[nodeIndex].clusterId = closestCH.id;
        }
      }
    });
    
    setNetwork({
      nodes,
      messagesTransmitted: 0,
      totalEnergyConsumed: 0
    });
  };
  
  const initializeSensors = () => {
    const sensorTypes = ['temperature', 'humidity', 'gas', 'motion', 'light', 'door'];
    const locations = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Garage', 'Garden'];
    const newSensors: Sensor[] = [];
    
    // Create 18 sensors (3 of each type)
    for (let i = 0; i < 18; i++) {
      const type = sensorTypes[i % sensorTypes.length];
      const nodeId = i + 1;
      const location = locations[Math.floor(i / 3)];
      
      let value: number | boolean;
      if (type === 'temperature') {
        value = 20 + Math.random() * 10; // 20-30°C
      } else if (type === 'humidity') {
        value = 30 + Math.random() * 50; // 30-80%
      } else if (type === 'gas') {
        value = 100 + Math.random() * 300; // 100-400 ppm
      } else if (type === 'motion') {
        value = Math.random() > 0.7; // 30% chance of motion detected
      } else if (type === 'light') {
        value = Math.random() * 1000; // 0-1000 lux
      } else { // door
        value = Math.random() > 0.8; // 20% chance of door open
      }
      
      newSensors.push({
        id: i + 1,
        nodeId,
        type,
        value,
        location,
        active: Math.random() > 0.1, // 90% of sensors are active
        battery: 50 + Math.floor(Math.random() * 50), // 50-100% battery
        lastUpdate: new Date().toISOString()
      });
    }
    
    setSensors(newSensors);
  };
  
  const calculateDistance = (node1: Node, node2: Node) => {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const runSimulation = (action?: string) => {
    setNetwork(prevNetwork => {
      const updatedNodes = [...prevNetwork.nodes];
      let additionalMessages = 0;
      let additionalEnergy = 0;
      
      // Handle specific actions
      if (action === 'rotateClusterHeads') {
        // Find nodes with low battery
        const lowBatteryCHs = updatedNodes.filter(
          node => node.isClusterHead && node.battery < 30
        );
        
        // Replace low battery CHs with new ones
        lowBatteryCHs.forEach(ch => {
          // Find a good candidate in the same cluster
          const clusterNodes = updatedNodes.filter(
            node => node.clusterId === ch.id && node.battery > 70 && !node.isClusterHead
          );
          
          if (clusterNodes.length > 0) {
            // Sort by battery level (highest first)
            clusterNodes.sort((a, b) => b.battery - a.battery);
            const newCH = clusterNodes[0];
            
            // Make the node a cluster head
            const newCHIndex = updatedNodes.findIndex(n => n.id === newCH.id);
            updatedNodes[newCHIndex].isClusterHead = true;
            updatedNodes[newCHIndex].clusterId = null;
            updatedNodes[newCHIndex].energyConsumptionRate += 0.5;
            
            // Demote the old cluster head
            const oldCHIndex = updatedNodes.findIndex(n => n.id === ch.id);
            updatedNodes[oldCHIndex].isClusterHead = false;
            updatedNodes[oldCHIndex].clusterId = newCH.id;
            updatedNodes[oldCHIndex].energyConsumptionRate -= 0.3;
            
            // Update cluster members to point to the new CH
            updatedNodes.forEach((node, index) => {
              if (node.clusterId === ch.id) {
                updatedNodes[index].clusterId = newCH.id;
              }
            });
            
            // This process consumes energy and generates messages
            additionalMessages += 5;
            additionalEnergy += 0.1;
          }
        });
      } else if (action === 'predictEnergy') {
        // No actual changes in this action, just for UI updates
      } else {
        // Regular simulation step:
        
        // 1. Consume battery based on energy consumption rate
        updatedNodes.forEach((node, index) => {
          if (node.active) {
            // Cluster heads consume more energy
            const energyUsed = node.isClusterHead ? 
              0.2 + (Math.random() * 0.3) : 
              0.05 + (Math.random() * 0.15);
            
            // Reduce battery
            updatedNodes[index].battery = Math.max(0, node.battery - energyUsed);
            
            // If battery is depleted, deactivate node
            if (updatedNodes[index].battery === 0) {
              updatedNodes[index].active = false;
              
              // If it was a cluster head, need to elect a new one
              if (node.isClusterHead) {
                // Find the node with highest battery in the cluster
                const clusterNodes = updatedNodes.filter(
                  n => n.clusterId === node.id && n.active && n.battery > 20
                );
                
                if (clusterNodes.length > 0) {
                  // Sort by battery level
                  clusterNodes.sort((a, b) => b.battery - a.battery);
                  const newCH = clusterNodes[0];
                  
                  // Make the node a cluster head
                  const newCHIndex = updatedNodes.findIndex(n => n.id === newCH.id);
                  updatedNodes[newCHIndex].isClusterHead = true;
                  updatedNodes[newCHIndex].clusterId = null;
                  
                  // Update cluster members to point to the new CH
                  updatedNodes.forEach((clusterNode, clusterIndex) => {
                    if (clusterNode.clusterId === node.id) {
                      updatedNodes[clusterIndex].clusterId = newCH.id;
                    }
                  });
                  
                  additionalMessages += 3;
                  additionalEnergy += 0.1;
                }
              }
            }
            
            // Add to energy tracking
            additionalEnergy += energyUsed;
          }
        });
        
        // 2. Simulate data transmissions
        const activeNodes = updatedNodes.filter(node => node.active);
        additionalMessages += Math.round(activeNodes.length * 0.5); // About half of active nodes send a message
      }
      
      return {
        nodes: updatedNodes,
        messagesTransmitted: prevNetwork.messagesTransmitted + additionalMessages,
        totalEnergyConsumed: prevNetwork.totalEnergyConsumed + additionalEnergy
      };
    });
    
    // Update simulation step
    setSimulationStep(prev => prev + 1);
    
    // Also update sensor data periodically
    if (simulationStep % 5 === 0) {
      refreshSensorData();
    }
  };
  
  const resetSimulation = () => {
    // Stop simulation
    setIsSimulationRunning(false);
    
    // Reset network state
    initializeNetwork(20);
    initializeSensors();
    
    // Reset counters
    setSimulationStep(0);
  };
  
  const toggleSimulation = () => {
    setIsSimulationRunning(prev => !prev);
  };
  
  const setNodeCount = (count: number) => {
    initializeNetwork(count);
  };
  
  const refreshSensorData = () => {
    setSensors(prev => {
      const updated = [...prev];
      
      updated.forEach((sensor, index) => {
        if (sensor.active) {
          // Update sensor values with some random changes
          if (sensor.type === 'temperature') {
            updated[index].value = Math.max(10, Math.min(35, (sensor.value as number) + (Math.random() - 0.5) * 2));
          } else if (sensor.type === 'humidity') {
            updated[index].value = Math.max(10, Math.min(95, (sensor.value as number) + (Math.random() - 0.5) * 5));
          } else if (sensor.type === 'gas') {
            updated[index].value = Math.max(50, Math.min(800, (sensor.value as number) + (Math.random() - 0.5) * 50));
          } else if (sensor.type === 'motion') {
            updated[index].value = Math.random() > 0.7;
          } else if (sensor.type === 'light') {
            updated[index].value = Math.max(0, Math.min(1000, (sensor.value as number) + (Math.random() - 0.5) * 100));
          } else if (sensor.type === 'door') {
            // Door state changes less frequently
            if (Math.random() > 0.9) {
              updated[index].value = !(sensor.value as boolean);
            }
          }
          
          // Update last update timestamp
          updated[index].lastUpdate = new Date().toISOString();
          
          // Slightly decrease battery
          updated[index].battery = Math.max(0, sensor.battery - Math.random() * 0.5);
        }
      });
      
      return updated;
    });
  };
  
  const generateMqttMessages = (sensorType: string, count: number) => {
    const messages = [];
    const relevantSensors = sensors.filter(s => s.type === sensorType && s.active);
    
    for (let i = 0; i < count; i++) {
      if (relevantSensors.length === 0) {
        // If no relevant sensors, generate a generic message
        const message = {
          timestamp: new Date().toLocaleTimeString(),
          topic: `home/sensors/${sensorType}/unknown`,
          payload: `{"error": "No active ${sensorType} sensors"}`
        };
        messages.push(message);
      } else {
        // Pick a random sensor
        const sensor = relevantSensors[Math.floor(Math.random() * relevantSensors.length)];
        
        // Format the payload as JSON
        const payload = {
          value: sensor.value,
          battery: sensor.battery,
          nodeId: sensor.nodeId,
          timestamp: new Date().toISOString()
        };
        
        const message = {
          timestamp: new Date().toLocaleTimeString(),
          topic: `home/sensors/${sensorType}/${sensor.id}`,
          payload: JSON.stringify(payload)
        };
        
        messages.push(message);
      }
    }
    
    return messages;
  };
  
  const runSecurityCheck = () => {
    // Simulate a security check
    console.log('Running security check...');
  };
  
  // Simple encryption/decryption for demo purposes
  const encryptText = (text: string, key: string) => {
    // This is a very basic substitution cipher for demo only
    // In a real system, use a proper encryption library
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode((charCode + keyChar) % 256);
    }
    return btoa(result); // Convert to base64
  };
  
  const decryptText = (text: string, key: string) => {
    try {
      const decodedText = atob(text); // Convert from base64
      let result = '';
      for (let i = 0; i < decodedText.length; i++) {
        const charCode = decodedText.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode((charCode - keyChar + 256) % 256);
      }
      return result;
    } catch (e) {
      return "Error decrypting: Invalid input";
    }
  };
  
  const generateNetworkTraffic = (count: number) => {
    const messages = [];
    const messageTypes = ['sensor_data', 'control', 'error'];
    const sourceNodes = [...network.nodes.map(node => `Node ${node.id}`), 'Cluster Head 1', 'Cluster Head 2', 'Gateway'];
    
    for (let i = 0; i < count; i++) {
      const type = messageTypes[Math.floor(Math.random() * (Math.random() > 0.9 ? 3 : 2))]; // Make errors less common
      const source = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
      let destination = 'Base Station';
      
      if (source.includes('Node')) {
        destination = Math.random() > 0.3 ? 'Cluster Head ' + Math.ceil(Math.random() * 2) : 'Base Station';
      } else if (source.includes('Cluster')) {
        destination = 'Base Station';
      } else {
        destination = sourceNodes[Math.floor(Math.random() * (sourceNodes.length - 1))];
      }
      
      let message = '';
      if (type === 'sensor_data') {
        const sensorType = ['temperature', 'humidity', 'motion', 'light', 'gas'][Math.floor(Math.random() * 5)];
        let value;
        
        if (sensorType === 'temperature') {
          value = (20 + Math.random() * 10).toFixed(1);
        } else if (sensorType === 'humidity') {
          value = (30 + Math.random() * 50).toFixed(1);
        } else if (sensorType === 'gas') {
          value = (100 + Math.random() * 300).toFixed(0);
        } else if (sensorType === 'motion') {
          value = Math.random() > 0.7 ? 'detected' : 'none';
        } else {
          value = (Math.random() * 1000).toFixed(0);
        }
        
        message = `{"type":"${sensorType}","value":${value},"battery":${Math.round(70 + Math.random() * 30)}}`;
      } else if (type === 'control') {
        const commands = ['sleep', 'wake', 'report', 'configure', 'restart'];
        const command = commands[Math.floor(Math.random() * commands.length)];
        message = `{"command":"${command}","params":{"interval":${Math.round(Math.random() * 60)}}}`;
      } else { // error
        const errors = ['timeout', 'low_battery', 'connection_lost', 'checksum_failed', 'sensor_failure'];
        const error = errors[Math.floor(Math.random() * errors.length)];
        message = `{"error":"${error}","code":${Math.round(Math.random() * 100)}}`;
      }
      
      messages.push({
        timestamp: new Date(Date.now() - Math.random() * 600000).toISOString(), // Random time in the last 10 minutes
        type,
        source,
        destination,
        message
      });
    }
    
    // Sort by timestamp (newest first)
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return messages;
  };
  
  return (
    <NetworkContext.Provider value={{
      network,
      sensors,
      simulationStep,
      isSimulationRunning,
      sensorData,
      runSimulation,
      resetSimulation,
      toggleSimulation,
      setNodeCount,
      refreshSensorData,
      generateMqttMessages,
      runSecurityCheck,
      encryptText,
      decryptText,
      generateNetworkTraffic
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};