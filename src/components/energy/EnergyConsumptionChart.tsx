import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

interface EnergyConsumptionChartProps {
  timeRange: string;
  showPredictions: boolean;
}

const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({ timeRange, showPredictions }) => {
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
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Generate data based on time range
    const dataPoints = generateEnergyData(timeRange);
    
    // Find min and max values for scaling
    let maxValue = Math.max(...dataPoints.regular, ...dataPoints.ch);
    if (showPredictions) {
      maxValue = Math.max(maxValue, ...dataPoints.predictedRegular, ...dataPoints.predictedCh);
    }
    
    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Energy Consumption Over Time', rect.width / 2, 20);
    
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
      ctx.fillText(`${value.toFixed(1)} mAh`, padding - 8, y + 3);
    }
    
    // Generate time labels
    const timeLabels = generateTimeLabels(timeRange);
    
    // Draw x-axis ticks and labels
    const xTickCount = Math.min(timeLabels.length, 7);
    for (let i = 0; i < xTickCount; i++) {
      const x = padding + (chartWidth / (xTickCount - 1)) * i;
      const labelIndex = Math.floor((i / (xTickCount - 1)) * (timeLabels.length - 1));
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, padding + chartHeight);
      ctx.lineTo(x, padding + chartHeight + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeLabels[labelIndex], x, padding + chartHeight + 20);
    }
    
    // Draw regular nodes line
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints.regular.length; i++) {
      const x = padding + (chartWidth / (dataPoints.regular.length - 1)) * i;
      const y = padding + chartHeight - (chartHeight * dataPoints.regular[i]) / maxValue;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw cluster head nodes line
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints.ch.length; i++) {
      const x = padding + (chartWidth / (dataPoints.ch.length - 1)) * i;
      const y = padding + chartHeight - (chartHeight * dataPoints.ch[i]) / maxValue;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw prediction lines if enabled
    if (showPredictions) {
      // Regular nodes prediction
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      const lastRealX = padding + (chartWidth / (dataPoints.regular.length - 1)) * (dataPoints.regular.length - 1);
      const lastRealY = padding + chartHeight - (chartHeight * dataPoints.regular[dataPoints.regular.length - 1]) / maxValue;
      
      ctx.moveTo(lastRealX, lastRealY);
      
      for (let i = 0; i < dataPoints.predictedRegular.length; i++) {
        const segmentWidth = chartWidth * 0.3; // Prediction takes 30% of chart width
        const x = lastRealX + (segmentWidth / (dataPoints.predictedRegular.length - 1)) * i;
        const y = padding + chartHeight - (chartHeight * dataPoints.predictedRegular[i]) / maxValue;
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Cluster head prediction
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      const lastChRealX = padding + (chartWidth / (dataPoints.ch.length - 1)) * (dataPoints.ch.length - 1);
      const lastChRealY = padding + chartHeight - (chartHeight * dataPoints.ch[dataPoints.ch.length - 1]) / maxValue;
      
      ctx.moveTo(lastChRealX, lastChRealY);
      
      for (let i = 0; i < dataPoints.predictedCh.length; i++) {
        const segmentWidth = chartWidth * 0.3;
        const x = lastChRealX + (segmentWidth / (dataPoints.predictedCh.length - 1)) * i;
        const y = padding + chartHeight - (chartHeight * dataPoints.predictedCh[i]) / maxValue;
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Reset line dash
      ctx.setLineDash([]);
    }
    
    // Draw legend
    const legendY = rect.height - 15;
    
    // Regular nodes
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, legendY);
    ctx.lineTo(padding + 20, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1F2937';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Regular Nodes', padding + 25, legendY + 3);
    
    // Cluster heads
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding + 120, legendY);
    ctx.lineTo(padding + 140, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'left';
    ctx.fillText('Cluster Heads', padding + 145, legendY + 3);
    
    // Predictions
    if (showPredictions) {
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding + 240, legendY);
      ctx.lineTo(padding + 260, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#1F2937';
      ctx.textAlign = 'left';
      ctx.fillText('Prediction', padding + 265, legendY + 3);
    }
    
  }, [timeRange, showPredictions, network]);
  
  // Helper function to generate energy consumption data
  const generateEnergyData = (timeRange: string) => {
    // Number of data points based on time range
    let dataPointCount = 24;
    switch (timeRange) {
      case '1h':
        dataPointCount = 12;
        break;
      case '6h':
        dataPointCount = 18;
        break;
      case '24h':
        dataPointCount = 24;
        break;
      case '7d':
        dataPointCount = 28;
        break;
    }
    
    // Get average consumption rate for regular nodes and cluster heads
    const clusterHeads = network.nodes.filter(node => node.isClusterHead);
    const regularNodes = network.nodes.filter(node => !node.isClusterHead);
    
    const avgChConsumption = clusterHeads.reduce((sum, node) => sum + node.energyConsumptionRate, 0) / 
                             (clusterHeads.length || 1);
    const avgRegularConsumption = regularNodes.reduce((sum, node) => sum + node.energyConsumptionRate, 0) / 
                                  (regularNodes.length || 1);
    
    // Generate data with some random variation
    const chData = [];
    const regularData = [];
    
    for (let i = 0; i < dataPointCount; i++) {
      // Add some random variation to consumption
      const chVariation = (Math.random() - 0.5) * avgChConsumption * 0.3;
      const regularVariation = (Math.random() - 0.5) * avgRegularConsumption * 0.3;
      
      // Consumption increases slightly over time
      const timeOffset = i / dataPointCount;
      
      chData.push(avgChConsumption + chVariation + avgChConsumption * timeOffset * 0.5);
      regularData.push(avgRegularConsumption + regularVariation + avgRegularConsumption * timeOffset * 0.2);
    }
    
    // Generate prediction data (3 points)
    const predictedCh = [];
    const predictedRegular = [];
    
    const lastCh = chData[chData.length - 1];
    const lastRegular = regularData[regularData.length - 1];
    
    for (let i = 0; i < 3; i++) {
      // Predictions show increasing trend
      predictedCh.push(lastCh * (1 + 0.1 * (i + 1)));
      predictedRegular.push(lastRegular * (1 + 0.05 * (i + 1)));
    }
    
    return {
      ch: chData,
      regular: regularData,
      predictedCh,
      predictedRegular
    };
  };
  
  // Helper function to generate time labels
  const generateTimeLabels = (timeRange: string) => {
    const now = new Date();
    let labels = [];
    
    switch (timeRange) {
      case '1h':
        // Generate labels every 5 minutes
        for (let i = 12; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 5 * 60000);
          labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '6h':
        // Generate labels every 30 minutes
        for (let i = 12; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 30 * 60000);
          labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '24h':
        // Generate labels every 2 hours
        for (let i = 12; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 2 * 60 * 60000);
          labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '7d':
        // Generate labels for each day
        for (let i = 7; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 24 * 60 * 60000);
          labels.push(time.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        }
        break;
    }
    
    return labels;
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default EnergyConsumptionChart;