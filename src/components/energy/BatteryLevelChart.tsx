import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

interface BatteryLevelChartProps {
  timeRange: string;
  showPredictions: boolean;
}

const BatteryLevelChart: React.FC<BatteryLevelChartProps> = ({ timeRange, showPredictions }) => {
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
    const dataPoints = generateBatteryData(timeRange);
    
    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Battery Level Over Time', rect.width / 2, 20);
    
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
    const yTickCount = 6; // 0%, 20%, 40%, 60%, 80%, 100%
    for (let i = 0; i < yTickCount; i++) {
      const y = padding + (chartHeight / (yTickCount - 1)) * (yTickCount - 1 - i);
      const value = (i / (yTickCount - 1)) * 100;
      
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
      ctx.fillText(`${value.toFixed(0)}%`, padding - 8, y + 3);
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
    
    // Draw cluster head battery line
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints.ch.length; i++) {
      const x = padding + (chartWidth / (dataPoints.ch.length - 1)) * i;
      const y = padding + chartHeight - (chartHeight * dataPoints.ch[i]) / 100;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw regular node battery line
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints.regular.length; i++) {
      const x = padding + (chartWidth / (dataPoints.regular.length - 1)) * i;
      const y = padding + chartHeight - (chartHeight * dataPoints.regular[i]) / 100;
      
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
      const lastRealY = padding + chartHeight - (chartHeight * dataPoints.regular[dataPoints.regular.length - 1]) / 100;
      
      ctx.moveTo(lastRealX, lastRealY);
      
      for (let i = 0; i < dataPoints.predictedRegular.length; i++) {
        const segmentWidth = chartWidth * 0.3; // Prediction takes 30% of chart width
        const x = lastRealX + (segmentWidth / (dataPoints.predictedRegular.length - 1)) * i;
        const y = padding + chartHeight - (chartHeight * dataPoints.predictedRegular[i]) / 100;
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Cluster head prediction
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      const lastChRealX = padding + (chartWidth / (dataPoints.ch.length - 1)) * (dataPoints.ch.length - 1);
      const lastChRealY = padding + chartHeight - (chartHeight * dataPoints.ch[dataPoints.ch.length - 1]) / 100;
      
      ctx.moveTo(lastChRealX, lastChRealY);
      
      for (let i = 0; i < dataPoints.predictedCh.length; i++) {
        const segmentWidth = chartWidth * 0.3;
        const x = lastChRealX + (segmentWidth / (dataPoints.predictedCh.length - 1)) * i;
        const y = padding + chartHeight - (chartHeight * dataPoints.predictedCh[i]) / 100;
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Reset line dash
      ctx.setLineDash([]);
    }
    
    // Add threshold line for low battery
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    const thresholdY = padding + chartHeight - (chartHeight * 20) / 100; // 20% threshold
    ctx.moveTo(padding, thresholdY);
    ctx.lineTo(padding + chartWidth, thresholdY);
    ctx.stroke();
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Add threshold label
    ctx.fillStyle = '#EF4444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Critical Level (20%)', padding + 5, thresholdY - 5);
    
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
  
  // Helper function to generate battery data
  const generateBatteryData = (timeRange: string) => {
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
    
    // Get average battery levels for regular nodes and cluster heads
    const clusterHeads = network.nodes.filter(node => node.isClusterHead);
    const regularNodes = network.nodes.filter(node => !node.isClusterHead);
    
    const avgChBattery = clusterHeads.reduce((sum, node) => sum + node.battery, 0) / 
                         (clusterHeads.length || 1);
    const avgRegularBattery = regularNodes.reduce((sum, node) => sum + node.battery, 0) / 
                              (regularNodes.length || 1);
    
    // Generate battery level data with some random variation
    const chData = [];
    const regularData = [];
    
    // Cluster heads drain faster than regular nodes
    const chDrainRate = 1.2; // % per data point
    const regularDrainRate = 0.7; // % per data point
    
    for (let i = 0; i < dataPointCount; i++) {
      const t = (dataPointCount - 1 - i) / (dataPointCount - 1); // Time factor (1 -> 0)
      
      // Add some random variation
      const chVariation = (Math.random() - 0.5) * 2;
      const regularVariation = (Math.random() - 0.5) * 1.5;
      
      // Calculate battery levels
      const chBattery = avgChBattery + (chDrainRate * (dataPointCount - 1 - i)) + chVariation;
      const regularBattery = avgRegularBattery + (regularDrainRate * (dataPointCount - 1 - i)) + regularVariation;
      
      // Ensure values are in the valid range
      chData.unshift(Math.min(100, Math.max(0, chBattery)));
      regularData.unshift(Math.min(100, Math.max(0, regularBattery)));
    }
    
    // Generate prediction data (3 points)
    const predictedCh = [];
    const predictedRegular = [];
    
    const lastCh = chData[chData.length - 1];
    const lastRegular = regularData[regularData.length - 1];
    
    for (let i = 0; i < 3; i++) {
      // Calculate predicted levels
      const predictedChBattery = lastCh - chDrainRate * (i + 1);
      const predictedRegularBattery = lastRegular - regularDrainRate * (i + 1);
      
      // Ensure values are in the valid range
      predictedCh.push(Math.max(0, predictedChBattery));
      predictedRegular.push(Math.max(0, predictedRegularBattery));
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

export default BatteryLevelChart;