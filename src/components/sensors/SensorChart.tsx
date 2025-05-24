import React, { useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

interface SensorChartProps {
  sensorType: string;
  sensors: any[];
  timeRange: string;
}

const SensorChart: React.FC<SensorChartProps> = ({ sensorType, sensors, timeRange }) => {
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
    
    // Generate random time-series data for each sensor
    const timeRangeMap: Record<string, number> = {
      '1h': 60,
      '6h': 360,
      '24h': 1440,
      '7d': 10080,
      '30d': 43200
    };
    
    const pointCount = timeRangeMap[timeRange] || 60; // Default to 1 hour (60 minutes)
    const stepSize = Math.max(1, Math.floor(pointCount / 100)); // Limit to 100 points max for performance
    
    // Only proceed with chart for data types that make sense in a time series
    if (['temperature', 'humidity', 'gas', 'light'].includes(sensorType)) {
      drawTimeSeriesChart(ctx, rect, sensorType, sensors, pointCount, stepSize);
    } else if (sensorType === 'motion') {
      drawEventChart(ctx, rect, 'Motion Events', sensors, pointCount, stepSize);
    } else if (sensorType === 'door') {
      drawStateChart(ctx, rect, 'Door Status', sensors, pointCount, stepSize);
    }
    
  }, [sensorType, sensors, timeRange]);
  
  const drawTimeSeriesChart = (ctx: CanvasRenderingContext2D, rect: DOMRect, title: string, sensors: any[], pointCount: number, stepSize: number) => {
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Generate time ranges
    const now = new Date();
    const timeLabels = Array.from({ length: Math.ceil(pointCount / stepSize) }, (_, i) => {
      const minutesAgo = pointCount - (i * stepSize);
      const date = new Date(now.getTime() - minutesAgo * 60000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }).reverse();
    
    // Determine value ranges based on sensor type
    let minValue = 0;
    let maxValue = 100;
    
    if (sensorType === 'temperature') {
      minValue = 10; // 10°C
      maxValue = 40; // 40°C
    } else if (sensorType === 'humidity') {
      minValue = 0; // 0%
      maxValue = 100; // 100%
    } else if (sensorType === 'gas') {
      minValue = 0; // 0 ppm
      maxValue = 1000; // 1000 ppm
    } else if (sensorType === 'light') {
      minValue = 0; // 0 lux
      maxValue = 1000; // 1000 lux
    }
    
    // Draw chart title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, rect.width / 2, 20);
    
    // Draw x and y axes
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
    const yTickStep = chartHeight / (yTickCount - 1);
    const yValueStep = (maxValue - minValue) / (yTickCount - 1);
    
    for (let i = 0; i < yTickCount; i++) {
      const y = padding + (chartHeight - (i * yTickStep));
      const value = minValue + (i * yValueStep);
      
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
      ctx.fillText(value.toFixed(0), padding - 8, y + 3);
    }
    
    // Draw x-axis ticks and labels
    const xLabelCount = Math.min(10, timeLabels.length);
    const xTickStep = chartWidth / (xLabelCount - 1);
    
    for (let i = 0; i < xLabelCount; i++) {
      const x = padding + (i * xTickStep);
      const labelIndex = Math.floor(i * (timeLabels.length - 1) / (xLabelCount - 1));
      const label = timeLabels[labelIndex];
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, padding + chartHeight);
      ctx.lineTo(x, padding + chartHeight + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, padding + chartHeight + 20);
    }
    
    // Generate data for each sensor
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    sensors.forEach((sensor, sensorIndex) => {
      if (!sensor.active) return; // Skip inactive sensors
      
      // Generate random data for this sensor
      const baseValue = sensor.value || 0;
      const dataPoints = [];
      
      for (let i = 0; i < pointCount; i += stepSize) {
        // Generate a value that randomly varies around the sensor's current value
        const randomVariation = (Math.random() - 0.5) * (maxValue - minValue) * 0.1;
        const timeOffset = i / pointCount; // Value increases slightly over time
        let value = baseValue + randomVariation + (timeOffset * 5);
        
        // Clamp values to min/max range
        value = Math.max(minValue, Math.min(maxValue, value));
        
        dataPoints.push({
          x: padding + (i / pointCount) * chartWidth,
          y: padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
        });
      }
      
      // Draw line
      ctx.strokeStyle = colors[sensorIndex % colors.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      dataPoints.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = colors[sensorIndex % colors.length];
      
      dataPoints.forEach((point, i) => {
        // Only draw every few points to avoid clutter
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });
    
    // Draw legend
    const legendY = padding - 15;
    let legendX = padding;
    
    sensors.forEach((sensor, index) => {
      if (!sensor.active) return;
      
      const color = colors[index % colors.length];
      const text = sensor.location || `Sensor ${sensor.id}`;
      
      // Draw color box
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 10, 10);
      
      // Draw sensor name
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(text, legendX + 15, legendY + 5);
      
      // Move to next legend item
      legendX += ctx.measureText(text).width + 30;
    });
  };
  
  const drawEventChart = (ctx: CanvasRenderingContext2D, rect: DOMRect, title: string, sensors: any[], pointCount: number, stepSize: number) => {
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Generate time ranges
    const now = new Date();
    const timeLabels = Array.from({ length: Math.ceil(pointCount / stepSize) }, (_, i) => {
      const minutesAgo = pointCount - (i * stepSize);
      const date = new Date(now.getTime() - minutesAgo * 60000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }).reverse();
    
    // Draw chart title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, rect.width / 2, 20);
    
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
    
    // Draw sensor rows
    const rowHeight = chartHeight / sensors.length;
    
    sensors.forEach((sensor, index) => {
      const y = padding + index * rowHeight;
      
      // Draw sensor label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(sensor.location || `Sensor ${sensor.id}`, padding - 8, y + rowHeight / 2);
      
      // Draw horizontal separator
      ctx.strokeStyle = '#F3F4F6';
      ctx.beginPath();
      ctx.moveTo(padding, y + rowHeight);
      ctx.lineTo(padding + chartWidth, y + rowHeight);
      ctx.stroke();
      
      // Generate random event data for this sensor
      const events = [];
      
      // More events for active sensors with motion detected
      const eventCount = sensor.active ? (sensor.value ? 5 : 2) : 0;
      
      for (let i = 0; i < eventCount; i++) {
        const eventTime = Math.random() * pointCount;
        events.push({
          x: padding + (eventTime / pointCount) * chartWidth,
          y: y + rowHeight / 2
        });
      }
      
      // Draw events as circles
      const color = sensor.active ? '#F59E0B' : '#9CA3AF';
      
      events.forEach(event => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(event.x, event.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.beginPath();
        ctx.arc(event.x, event.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Draw x-axis ticks and labels
    const xLabelCount = Math.min(10, timeLabels.length);
    const xTickStep = chartWidth / (xLabelCount - 1);
    
    for (let i = 0; i < xLabelCount; i++) {
      const x = padding + (i * xTickStep);
      const labelIndex = Math.floor(i * (timeLabels.length - 1) / (xLabelCount - 1));
      const label = timeLabels[labelIndex];
      
      // Draw tick
      ctx.strokeStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(x, padding + chartHeight);
      ctx.lineTo(x, padding + chartHeight + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, padding + chartHeight + 20);
    }
  };
  
  const drawStateChart = (ctx: CanvasRenderingContext2D, rect: DOMRect, title: string, sensors: any[], pointCount: number, stepSize: number) => {
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Generate time ranges
    const now = new Date();
    const timeLabels = Array.from({ length: Math.ceil(pointCount / stepSize) }, (_, i) => {
      const minutesAgo = pointCount - (i * stepSize);
      const date = new Date(now.getTime() - minutesAgo * 60000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }).reverse();
    
    // Draw chart title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, rect.width / 2, 20);
    
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
    
    // Draw sensor rows
    const rowHeight = chartHeight / sensors.length;
    
    sensors.forEach((sensor, index) => {
      const y = padding + index * rowHeight;
      
      // Draw sensor label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(sensor.location || `Sensor ${sensor.id}`, padding - 8, y + rowHeight / 2);
      
      // Draw horizontal separator
      ctx.strokeStyle = '#F3F4F6';
      ctx.beginPath();
      ctx.moveTo(padding, y + rowHeight);
      ctx.lineTo(padding + chartWidth, y + rowHeight);
      ctx.stroke();
      
      // Generate door state changes data
      const stateChanges = [];
      let lastStateWasOpen = Math.random() > 0.5;
      
      // More state changes for active sensors
      const changeCount = sensor.active ? 4 : 1;
      
      for (let i = 0; i < changeCount; i++) {
        const changeTime = (i + 0.5) * (pointCount / (changeCount + 1));
        lastStateWasOpen = !lastStateWasOpen;
        
        stateChanges.push({
          x: padding + (changeTime / pointCount) * chartWidth,
          y: y + rowHeight / 2,
          state: lastStateWasOpen
        });
      }
      
      // Draw state changes as rectangles
      let lastX = padding;
      let lastState = false; // Closed
      
      stateChanges.forEach((change, i) => {
        // Draw rectangle from last point to this change
        const color = lastState ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillStyle = color;
        ctx.fillRect(lastX, y + 5, change.x - lastX, rowHeight - 10);
        
        // Draw vertical line at change point
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(change.x, y + 5);
        ctx.lineTo(change.x, y + rowHeight - 5);
        ctx.stroke();
        
        // Update for next segment
        lastX = change.x;
        lastState = change.state;
      });
      
      // Draw final segment
      const finalColor = lastState ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.fillStyle = finalColor;
      ctx.fillRect(lastX, y + 5, padding + chartWidth - lastX, rowHeight - 10);
      
      // Draw current state label
      ctx.fillStyle = sensor.value ? '#10B981' : '#EF4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(sensor.value ? 'Open' : 'Closed', padding + chartWidth + 5, y + rowHeight / 2);
    });
    
    // Draw x-axis ticks and labels
    const xLabelCount = Math.min(10, timeLabels.length);
    const xTickStep = chartWidth / (xLabelCount - 1);
    
    for (let i = 0; i < xLabelCount; i++) {
      const x = padding + (i * xTickStep);
      const labelIndex = Math.floor(i * (timeLabels.length - 1) / (xLabelCount - 1));
      const label = timeLabels[labelIndex];
      
      // Draw tick
      ctx.strokeStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(x, padding + chartHeight);
      ctx.lineTo(x, padding + chartHeight + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, padding + chartHeight + 20);
    }
    
    // Draw legend
    const legendY = rect.height - 20;
    
    // Open state
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(padding, legendY - 5, 15, 10);
    ctx.fillStyle = '#10B981';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Open', padding + 20, legendY);
    
    // Closed state
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(padding + 80, legendY - 5, 15, 10);
    ctx.fillStyle = '#EF4444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Closed', padding + 100, legendY);
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

export default SensorChart;