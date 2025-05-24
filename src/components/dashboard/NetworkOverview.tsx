import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

const NetworkOverview: React.FC = () => {
  const { network } = useNetwork();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Get the size of the canvas in CSS pixels
    const rect = canvas.getBoundingClientRect();
    
    // Give the canvas pixel dimensions of their CSS size * the device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale all drawing operations by the dpr
    ctx.scale(dpr, dpr);
    
    // Set canvas size in CSS
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw network overview
    const padding = 20;
    const availableWidth = rect.width - padding * 2;
    const availableHeight = rect.height - padding * 2;
    
    const baseStationX = rect.width / 2;
    const baseStationY = padding + 20;
    
    // Draw base station
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(baseStationX, baseStationY, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1F2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Base Station', baseStationX, baseStationY - 20);
    
    // Draw cluster heads
    const clusterHeads = network.nodes.filter(node => node.isClusterHead);
    const chSpacing = availableWidth / (clusterHeads.length + 1);
    
    clusterHeads.forEach((ch, index) => {
      const x = padding + chSpacing * (index + 1);
      const y = baseStationY + 80;
      
      // Draw connection to base station
      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(baseStationX, baseStationY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Draw cluster head
      ctx.fillStyle = ch.battery < 30 ? '#F87171' : '#10B981';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`CH ${ch.id}`, x, y - 15);
      
      // Draw cluster members
      const clusterMembers = network.nodes.filter(node => 
        !node.isClusterHead && node.clusterId === ch.id
      );
      
      const memberRadius = 40;
      const memberCount = clusterMembers.length;
      
      clusterMembers.forEach((member, mIndex) => {
        const angle = (2 * Math.PI * mIndex) / memberCount;
        const mx = x + Math.cos(angle) * memberRadius;
        const my = y + Math.sin(angle) * memberRadius;
        
        // Draw connection to cluster head
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(mx, my);
        ctx.stroke();
        
        // Draw node
        ctx.fillStyle = member.active ? '#60A5FA' : '#9CA3AF';
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Draw legend
    const legendY = rect.height - 30;
    
    // Base station
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(padding, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'left';
    ctx.fillText('Base Station', padding + 10, legendY + 4);
    
    // Cluster head
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(padding + 100, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Cluster Head', padding + 110, legendY + 4);
    
    // Regular node
    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.arc(padding + 200, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Sensor Node', padding + 210, legendY + 4);
    
  }, [network]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default NetworkOverview;