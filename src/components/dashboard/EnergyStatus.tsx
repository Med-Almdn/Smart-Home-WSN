import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

const EnergyStatus: React.FC = () => {
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
    
    // Draw energy bar chart
    const padding = 40;
    const barPadding = 30;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Get all nodes that are cluster heads
    const clusterHeads = network.nodes.filter(node => node.isClusterHead);
    
    // Get all regular nodes
    const regularNodes = network.nodes.filter(node => !node.isClusterHead);
    
    // If no cluster heads, show a message
    if (clusterHeads.length === 0) {
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No cluster heads available', rect.width / 2, rect.height / 2);
      return;
    }
    
    // Calculate average battery levels
    const avgChBattery = clusterHeads.reduce((acc, ch) => acc + ch.battery, 0) / clusterHeads.length;
    const avgNodeBattery = regularNodes.reduce((acc, node) => acc + node.battery, 0) / regularNodes.length;
    
    // Calculate bar width
    const barWidth = (chartWidth - barPadding) / 2;
    
    // Draw bars
    
    // Cluster Head Bar
    const chX = padding;
    const chHeight = (chartHeight * avgChBattery) / 100;
    const chY = padding + chartHeight - chHeight;
    
    // Draw bar
    ctx.fillStyle = avgChBattery < 30 ? '#F87171' : avgChBattery < 60 ? '#FBBF24' : '#34D399';
    ctx.fillRect(chX, chY, barWidth, chHeight);
    
    // Draw label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cluster Heads', chX + barWidth / 2, padding + chartHeight + 20);
    
    // Draw percentage
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(avgChBattery)}%`, chX + barWidth / 2, chY - 10);
    
    // Regular Node Bar
    const nodeX = padding + barWidth + barPadding;
    const nodeHeight = (chartHeight * avgNodeBattery) / 100;
    const nodeY = padding + chartHeight - nodeHeight;
    
    // Draw bar
    ctx.fillStyle = avgNodeBattery < 30 ? '#F87171' : avgNodeBattery < 60 ? '#FBBF24' : '#34D399';
    ctx.fillRect(nodeX, nodeY, barWidth, nodeHeight);
    
    // Draw label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Regular Nodes', nodeX + barWidth / 2, padding + chartHeight + 20);
    
    // Draw percentage
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(avgNodeBattery)}%`, nodeX + barWidth / 2, nodeY - 10);
    
    // Draw y-axis
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Draw y-axis line
    ctx.beginPath();
    ctx.moveTo(padding - 10, padding);
    ctx.lineTo(padding - 10, padding + chartHeight);
    ctx.stroke();
    
    // Draw y-axis ticks and labels
    for (let i = 0; i <= 100; i += 20) {
      const y = padding + chartHeight - (chartHeight * i) / 100;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(padding - 15, y);
      ctx.lineTo(padding - 10, y);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${i}%`, padding - 20, y + 3);
    }
    
    // Draw title
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Average Battery Levels', rect.width / 2, 20);
    
  }, [network]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default EnergyStatus;