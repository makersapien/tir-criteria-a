// src/components/TIRSimulation.tsx - Total Internal Reflection Simulator
import React, { useState, useRef, useEffect } from 'react';

const TIRsimulation: React.FC = () => {
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [refractiveIndex1, setRefractiveIndex1] = useState(1.5); // Glass
  const [refractiveIndex2, setRefractiveIndex2] = useState(1.0); // Air
  const [wavelength, setWavelength] = useState(550); // nm
  const [showCriticalAngle, setShowCriticalAngle] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const canvasWidth = 800;
  const canvasHeight = 500;
  const interfaceY = canvasHeight / 2;

  // Calculate critical angle
  const criticalAngle = Math.asin(refractiveIndex2 / refractiveIndex1) * (180 / Math.PI);
  const isTotalInternalReflection = incidentAngle > criticalAngle;

  // Calculate refracted angle (if no TIR)
  const refractedAngle = !isTotalInternalReflection 
    ? Math.asin((refractiveIndex1 / refractiveIndex2) * Math.sin(incidentAngle * Math.PI / 180)) * (180 / Math.PI)
    : 0;

  useEffect(() => {
    drawSimulation();
  }, [incidentAngle, refractiveIndex1, refractiveIndex2, wavelength, showCriticalAngle]);

  const drawSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw media
    // Medium 1 (denser)
    ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.fillRect(0, interfaceY, canvasWidth, canvasHeight - interfaceY);
    
    // Medium 2 (less dense)
    ctx.fillStyle = 'rgba(255, 255, 100, 0.2)';
    ctx.fillRect(0, 0, canvasWidth, interfaceY);

    // Draw interface
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, interfaceY);
    ctx.lineTo(canvasWidth, interfaceY);
    ctx.stroke();

    // Draw normal line
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate ray positions
    const centerX = canvasWidth / 2;
    const rayLength = 150;
    
    // Incident ray
    const incidentX = centerX - rayLength * Math.sin(incidentAngle * Math.PI / 180);
    const incidentY = interfaceY + rayLength * Math.cos(incidentAngle * Math.PI / 180);
    
    // Draw incident ray
    ctx.strokeStyle = getWavelengthColor(wavelength);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(centerX, interfaceY);
    ctx.stroke();

    // Draw arrow for incident ray
    drawArrow(ctx, incidentX, incidentY, centerX, interfaceY, getWavelengthColor(wavelength));

    // Reflected ray
    const reflectedX = centerX + rayLength * Math.sin(incidentAngle * Math.PI / 180);
    const reflectedY = interfaceY + rayLength * Math.cos(incidentAngle * Math.PI / 180);
    
    ctx.strokeStyle = getWavelengthColor(wavelength);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, interfaceY);
    ctx.lineTo(reflectedX, reflectedY);
    ctx.stroke();

    drawArrow(ctx, centerX, interfaceY, reflectedX, reflectedY, getWavelengthColor(wavelength));

    // Refracted ray (if no TIR)
    if (!isTotalInternalReflection) {
      const refractedX = centerX + rayLength * Math.sin(refractedAngle * Math.PI / 180);
      const refractedY = interfaceY - rayLength * Math.cos(refractedAngle * Math.PI / 180);
      
      ctx.strokeStyle = getWavelengthColor(wavelength);
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(centerX, interfaceY);
      ctx.lineTo(refractedX, refractedY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      drawArrow(ctx, centerX, interfaceY, refractedX, refractedY, getWavelengthColor(wavelength));
    }

    // Draw critical angle line (if enabled)
    if (showCriticalAngle && !isNaN(criticalAngle)) {
      const criticalX = centerX - rayLength * Math.sin(criticalAngle * Math.PI / 180);
      const criticalY = interfaceY + rayLength * Math.cos(criticalAngle * Math.PI / 180);
      
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(criticalX, criticalY);
      ctx.lineTo(centerX, interfaceY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw labels and measurements
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    
    // Medium labels
    ctx.fillText(`Medium 1 (n₁ = ${refractiveIndex1})`, 20, interfaceY + 30);
    ctx.fillText(`Medium 2 (n₂ = ${refractiveIndex2})`, 20, 30);
    
    // Angle measurements
    ctx.fillText(`Incident Angle: ${incidentAngle.toFixed(1)}°`, 20, canvasHeight - 80);
    ctx.fillText(`Critical Angle: ${criticalAngle.toFixed(1)}°`, 20, canvasHeight - 60);
    
    if (!isTotalInternalReflection) {
      ctx.fillText(`Refracted Angle: ${refractedAngle.toFixed(1)}°`, 20, canvasHeight - 40);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('TOTAL INTERNAL REFLECTION!', 20, canvasHeight - 40);
    }

    // Draw angle arcs
    drawAngleArc(ctx, centerX, interfaceY, incidentAngle, 'incident');
    if (!isTotalInternalReflection) {
      drawAngleArc(ctx, centerX, interfaceY, refractedAngle, 'refracted');
    }
  };

  const getWavelengthColor = (wavelength: number): string => {
    // Convert wavelength to RGB color
    if (wavelength < 380) return '#8b00ff'; // Violet
    if (wavelength < 450) return '#4b0082'; // Violet
    if (wavelength < 495) return '#0000ff'; // Blue
    if (wavelength < 570) return '#00ff00'; // Green
    if (wavelength < 590) return '#ffff00'; // Yellow
    if (wavelength < 620) return '#ffa500'; // Orange
    if (wavelength < 750) return '#ff0000'; // Red
    return '#ff0000'; // Default red
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawAngleArc = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    angle: number,
    type: 'incident' | 'refracted'
  ) => {
    const radius = 40;
    const startAngle = type === 'incident' ? Math.PI / 2 : -Math.PI / 2;
    const endAngle = type === 'incident' 
      ? Math.PI / 2 - (angle * Math.PI / 180)
      : -Math.PI / 2 + (angle * Math.PI / 180);
    
    ctx.strokeStyle = type === 'incident' ? '#333' : '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
    ctx.stroke();
    
    // Angle label
    const labelAngle = (startAngle + endAngle) / 2;
    const labelX = centerX + (radius + 15) * Math.cos(labelAngle);
    const labelY = centerY + (radius + 15) * Math.sin(labelAngle);
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${angle.toFixed(0)}°`, labelX - 10, labelY + 5);
  };

  const startAnimation = () => {
    setIsAnimating(true);
    let currentAngle = 0;
    
    const animate = () => {
      currentAngle += animationSpeed;
      setIncidentAngle(currentAngle % 90);
      
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetSimulation = () => {
    stopAnimation();
    setIncidentAngle(30);
    setRefractiveIndex1(1.5);
    setRefractiveIndex2(1.0);
    setWavelength(550);
  };

  return (
    <div className="tir-simulation p-4 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-purple-800">🌈 Total Internal Reflection Simulator</h2>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border border-gray-300 bg-white rounded"
          />
          
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              ▶ Animate
            </button>
            <button
              onClick={stopAnimation}
              disabled={!isAnimating}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              ⏸ Stop
            </button>
            <button
              onClick={resetSimulation}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              🔄 Reset
            </button>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCriticalAngle}
                onChange={(e) => setShowCriticalAngle(e.target.checked)}
                className="mr-2"
              />
              Show Critical Angle
            </label>
          </div>
        </div>
        
        <div className="w-80 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-purple-700">Controls</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Incident Angle: {incidentAngle.toFixed(1)}°
              </label>
              <input
                type="range"
                min="0"
                max="89"
                step="0.5"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(parseFloat(e.target.value))}
                className="w-full"
                disabled={isAnimating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Refractive Index 1 (Dense): {refractiveIndex1}
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={refractiveIndex1}
                onChange={(e) => setRefractiveIndex1(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Refractive Index 2 (Less Dense): {refractiveIndex2}
              </label>
              <input
                type="range"
                min="1.0"
                max="1.5"
                step="0.1"
                value={refractiveIndex2}
                onChange={(e) => setRefractiveIndex2(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Wavelength: {wavelength} nm
              </label>
              <input
                type="range"
                min="380"
                max="750"
                step="10"
                value={wavelength}
                onChange={(e) => setWavelength(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                {wavelength < 450 ? 'Violet/Blue' : 
                 wavelength < 495 ? 'Blue' :
                 wavelength < 570 ? 'Green' :
                 wavelength < 590 ? 'Yellow' :
                 wavelength < 620 ? 'Orange' : 'Red'}
              </div>
            </div>
            
            {isAnimating && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Animation Speed: {animationSpeed}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          <div className="mt-6 p-3 bg-purple-50 rounded">
            <h4 className="font-semibold text-purple-800 mb-2">📊 Current Data:</h4>
            <div className="text-sm space-y-1">
              <div>Critical Angle: <strong>{criticalAngle.toFixed(2)}°</strong></div>
              <div>Incident Angle: <strong>{incidentAngle.toFixed(1)}°</strong></div>
              {!isTotalInternalReflection && (
                <div>Refracted Angle: <strong>{refractedAngle.toFixed(1)}°</strong></div>
              )}
              <div className={`font-bold ${isTotalInternalReflection ? 'text-red-600' : 'text-green-600'}`}>
                {isTotalInternalReflection ? 'Total Internal Reflection' : 'Refraction Occurs'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-purple-700">🧠 Learning Objectives</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Understand the relationship between incident angle and refraction</li>
          <li>Calculate the critical angle using Snell's law</li>
          <li>Observe when total internal reflection occurs</li>
          <li>Explore how refractive indices affect light behavior</li>
          <li>Apply concepts to real-world applications like fiber optics</li>
        </ul>
        
        <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-sm"><strong>Formula:</strong> sin(θc) = n₂/n₁ where θc is the critical angle</p>
          <p className="text-sm"><strong>Condition:</strong> Total internal reflection occurs when θᵢ greater than  θc</p>
        </div>
      </div>
    </div>
  );
};

export default TIRsimulation;