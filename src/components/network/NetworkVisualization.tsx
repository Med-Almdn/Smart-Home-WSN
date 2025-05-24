import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

interface NetworkVisualizationProps {
  zoomLevel: number;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ zoomLevel }) => {
  const { network, simulationStep } = useNetwork();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    
    // Apply zoom
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.translate(rect.width / 2, rect.height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-rect.width / 2, -rect.height / 2);
    
    // Draw base station at center top
    const baseStationX = rect.width / 2;
    const baseStationY = 50;
    
    // Draw base station
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.arc(baseStationX, baseStationY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BS', baseStationX, baseStationY);
    
    // Draw network nodes
    network.nodes.forEach(node => {
      const { x, y, isClusterHead, active, battery, id, clusterId } = node;
      
      // Scale coordinates to canvas
      const nodeX = x * (rect.width - 100) + 50;
      const nodeY = y * (rect.height - 100) + 100;
      
      // Draw connection to cluster head or base station
      if (active) {
        if (isClusterHead) {
          // Draw connection to base station
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(nodeX, nodeY);
          ctx.lineTo(baseStationX, baseStationY);
          ctx.stroke();
          
          // Draw range circle for cluster head
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 80, 0, Math.PI * 2);
          ctx.stroke();
        } else if (clusterId !== null) {
          // Find the cluster head
          const clusterHead = network.nodes.find(n => n.id === clusterId);
          if (clusterHead) {
            const chX = clusterHead.x * (rect.width - 100) + 50;
            const chY = clusterHead.y * (rect.height - 100) + 100;
            
            // Draw connection to cluster head
            ctx.strokeStyle = 'rgba(209, 213, 219, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodeX, nodeY);
            ctx.lineTo(chX, chY);
            ctx.stroke();
          }
        }
      }
      
      // Draw node
      const nodeRadius = isClusterHead ? 10 : 6;
      
      // Set color based on battery level and status
      let nodeColor;
      if (!active) {
        nodeColor = '#9CA3AF'; // Gray for inactive
      } else if (battery < 20) {
        nodeColor = '#F87171'; // Red for low battery
      } else if (isClusterHead) {
        nodeColor = '#10B981'; // Green for cluster head
      } else {
        nodeColor = '#60A5FA'; // Blue for regular node
      }
      
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw node ID
      ctx.fillStyle = '#1F2937';
      ctx.font = isClusterHead ? 'bold 10px sans-serif' : '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelY = nodeY - nodeRadius - 8;
      if (isClusterHead) {
        ctx.fillText(`CH ${id}`, nodeX, labelY);
      } else {
        ctx.fillText(`${id}`, nodeX, labelY);
      }
      
      // Draw battery level indicator
      const batteryWidth = 14;
      const batteryHeight = 4;
      const batteryX = nodeX - batteryWidth / 2;
      const batteryY = nodeY + nodeRadius + 4;
      
      // Draw battery outline
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(batteryX, batteryY, batteryWidth, batteryHeight);
      
      // Draw battery level
      let batteryColor;
      if (battery < 20) {
        batteryColor = '#F87171'; // Red
      } else if (battery < 50) {
        batteryColor = '#FBBF24'; // Yellow
      } else {
        batteryColor = '#34D399'; // Green
      }
      
      const batteryLevel = (battery / 100) * batteryWidth;
      ctx.fillStyle = batteryColor;
      ctx.fillRect(batteryX, batteryY, batteryLevel, batteryHeight);
    });
    
    // Draw legend
    const legendY = rect.height - 30;
    const legendX = 20;
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '10px sans-serif';
    
    // Base station
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Base Station', legendX + 10, legendY);
    
    // Cluster head
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(legendX + 100, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Cluster Head', legendX + 110, legendY);
    
    // Regular node
    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.arc(legendX + 200, legendY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Sensor Node', legendX + 210, legendY);
    
    // Inactive node
    ctx.fillStyle = '#9CA3AF';
    ctx.beginPath();
    ctx.arc(legendX + 300, legendY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Inactive Node', legendX + 310, legendY);
    
    // Low battery node
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.arc(legendX + 400, legendY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Low Battery', legendX + 410, legendY);
    
    ctx.restore();
  }, [network, zoomLevel, simulationStep]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default NetworkVisualization;