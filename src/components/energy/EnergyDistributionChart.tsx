import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

const EnergyDistributionChart: React.FC = () => {
  const { network } = useNetwork();
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
    
    // Set canvas size in CSS
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw chart
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    
    // Calculate energy consumption breakdown
    const energyData = calculateEnergyDistribution();
    
    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Energy Distribution by Activity', centerX, 20);
    
    // Define colors
    const colors = [
      '#3B82F6', // Communication
      '#10B981', // Sensing
      '#F59E0B', // Processing
      '#EC4899', // Sleep/Idle
      '#8B5CF6'  // Cluster Head Duties
    ];
    
    // Draw pie chart
    let startAngle = 0;
    
    energyData.forEach((item, index) => {
      const sliceAngle = 2 * Math.PI * item.percentage / 100;
      
      // Draw slice
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      // Draw slice border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Calculate label position
      const labelAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      // Draw percentage label if slice is large enough
      if (item.percentage > 5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(item.percentage)}%`, labelX, labelY);
      }
      
      startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = 30;
    let legendY = rect.height - 100;
    
    energyData.forEach((item, index) => {
      // Draw color box
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(legendX, legendY, 15, 15);
      
      // Draw label
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.activity} (${item.percentage.toFixed(1)}%)`, legendX + 25, legendY + 7.5);
      
      legendY += 20;
    });
    
  }, [network]);
  
  // Helper function to calculate energy distribution
  const calculateEnergyDistribution = () => {
    // In a real system, this would be based on actual energy measurements
    
    // For simulation, we'll use the network state to make some educated guesses
    const chPercentage = network.nodes.filter(node => node.isClusterHead).length / network.nodes.length;
    
    // Cluster heads spend more energy on communication and processing
    // Regular nodes spend more energy on sensing and sleep
    
    // Base distribution (for regular nodes)
    let communicationPercentage = 30;
    let sensingPercentage = 25;
    let processingPercentage = 15;
    let sleepPercentage = 25;
    let clusterHeadDutiesPercentage = 5;
    
    // Adjust based on cluster head percentage
    communicationPercentage += chPercentage * 10;
    processingPercentage += chPercentage * 5;
    clusterHeadDutiesPercentage += chPercentage * 10;
    sensingPercentage -= chPercentage * 15;
    sleepPercentage -= chPercentage * 10;
    
    // Ensure percentages are positive
    sensingPercentage = Math.max(5, sensingPercentage);
    sleepPercentage = Math.max(5, sleepPercentage);
    
    // Normalize to ensure total is 100%
    const total = communicationPercentage + sensingPercentage + processingPercentage + sleepPercentage + clusterHeadDutiesPercentage;
    const normalizer = 100 / total;
    
    return [
      { activity: 'Communication', percentage: communicationPercentage * normalizer },
      { activity: 'Sensing', percentage: sensingPercentage * normalizer },
      { activity: 'Processing', percentage: processingPercentage * normalizer },
      { activity: 'Sleep/Idle', percentage: sleepPercentage * normalizer },
      { activity: 'Cluster Head Duties', percentage: clusterHeadDutiesPercentage * normalizer }
    ];
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default EnergyDistributionChart;