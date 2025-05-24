import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

const ClusterHeadEnergyComparison: React.FC = () => {
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
    const padding = 50;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Get cluster heads
    const clusterHeads = network.nodes.filter(node => node.isClusterHead);
    
    // If no cluster heads, show a message
    if (clusterHeads.length === 0) {
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No cluster heads available', rect.width / 2, rect.height / 2);
      return;
    }
    
    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cluster Head Energy Comparison', rect.width / 2, 20);
    
    // Sort cluster heads by ID
    clusterHeads.sort((a, b) => a.id - b.id);
    
    // Calculate bar width and spacing
    const barCount = clusterHeads.length;
    const barSpacing = 20;
    const barWidth = (chartWidth - (barCount - 1) * barSpacing) / barCount;
    
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
    
    // Draw y-axis ticks and labels - for battery percentage (0-100%)
    const batteryTicks = 5;
    for (let i = 0; i <= batteryTicks; i++) {
      const y = padding + chartHeight * (1 - i / batteryTicks);
      const value = (i / batteryTicks) * 100;
      
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
      ctx.fillText(`${value}%`, padding - 10, y);
    }
    
    // Draw secondary y-axis for energy consumption rate (right side)
    const maxConsumptionRate = Math.max(...clusterHeads.map(ch => ch.energyConsumptionRate), 1);
    const consumptionTicks = 5;
    
    for (let i = 0; i <= consumptionTicks; i++) {
      const y = padding + chartHeight * (1 - i / consumptionTicks);
      const value = (i / consumptionTicks) * maxConsumptionRate;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(padding + chartWidth, y);
      ctx.lineTo(padding + chartWidth + 5, y);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${value.toFixed(1)}`, padding + chartWidth + 10, y);
    }
    
    // Draw "mAh/h" label on right y-axis
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('mAh/h', padding + chartWidth + 25, padding);
    
    // Draw "Battery %" label on left y-axis
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('Battery %', padding - 35, padding);
    
    // Draw bars for battery level and consumption rate
    clusterHeads.forEach((ch, index) => {
      const barX = padding + index * (barWidth + barSpacing);
      
      // Battery level bar
      const batteryHeight = (chartHeight * ch.battery) / 100;
      const batteryY = padding + chartHeight - batteryHeight;
      
      ctx.fillStyle = ch.battery < 20 ? '#F87171' : ch.battery < 50 ? '#FBBF24' : '#34D399';
      ctx.fillRect(barX, batteryY, barWidth / 2 - 2, batteryHeight);
      
      // Consumption rate bar
      const rateBarX = barX + barWidth / 2 + 2;
      const consumptionHeight = (chartHeight * ch.energyConsumptionRate) / maxConsumptionRate;
      const consumptionY = padding + chartHeight - consumptionHeight;
      
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(rateBarX, consumptionY, barWidth / 2 - 2, consumptionHeight);
      
      // Draw node ID label
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`CH ${ch.id}`, barX + barWidth / 2, padding + chartHeight + 5);
      
      // Draw battery percentage on top of battery bar
      if (batteryHeight > 15) { // Only if bar is tall enough
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${ch.battery}%`, barX + barWidth / 4, batteryY + batteryHeight / 2);
      }
      
      // Draw consumption rate on top of rate bar
      if (consumptionHeight > 15) { // Only if bar is tall enough
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${ch.energyConsumptionRate.toFixed(1)}`, rateBarX + barWidth / 4, consumptionY + consumptionHeight / 2);
      }
    });
    
    // Draw legend
    const legendY = rect.height - 20;
    
    // Battery level
    ctx.fillStyle = '#34D399';
    ctx.fillRect(padding, legendY - 5, 15, 10);
    ctx.fillStyle = '#1F2937';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Battery Level', padding + 20, legendY);
    
    // Consumption rate
    ctx.fillStyle = '#60A5FA';
    ctx.fillRect(padding + 120, legendY - 5, 15, 10);
    ctx.fillStyle = '#1F2937';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Energy Consumption Rate', padding + 140, legendY);
    
  }, [network]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default ClusterHeadEnergyComparison;