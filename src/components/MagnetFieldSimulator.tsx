import { useState, useEffect, useRef } from 'react';

const MagnetFieldSimulator = () => {
  const [magnets, setMagnets] = useState([
    { id: 1, x: 300, y: 250, strength: 100, dragging: false, pole: 'north' }
  ]);
  const [meter, setMeter] = useState({ x: 500, y: 250, dragging: false });
  const [fieldStrength, setFieldStrength] = useState(0);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [experiment, setExperiment] = useState('distance'); // 'distance' or 'multiple'
  const [distances, setDistances] = useState([]);
  const [fieldStrengths, setFieldStrengths] = useState([]);
  const [recording, setRecording] = useState(false);
  const canvasRef = useRef(null);
  const [displayDistanceLine, setDisplayDistanceLine] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Constants
  const gridSize = 20;
  const canvasWidth = 800;
  const canvasHeight = 500;
  const maxMagnets = 5;

  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas();
    }
  }, [magnets, meter, showFieldLines, displayDistanceLine]);

  useEffect(() => {
    // Calculate field strength whenever magnets or meter positions change
    calculateFieldStrength();
  }, [magnets, meter]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw scale numbers
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    for (let x = 0; x <= canvasWidth; x += gridSize * 5) {
      ctx.fillText(`${x}`, x, 10);
    }
    for (let y = 0; y <= canvasHeight; y += gridSize * 5) {
      ctx.fillText(`${y}`, 0, y + 10);
    }

    // Draw magnetic field lines if enabled
    if (showFieldLines) {
      drawFieldLines(ctx);
    }

    // Draw distance measurement line
    if (displayDistanceLine && magnets.length > 0) {
      const mainMagnet = magnets[0];
      ctx.beginPath();
      ctx.moveTo(mainMagnet.x, mainMagnet.y);
      ctx.lineTo(meter.x, meter.y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(meter.x - mainMagnet.x, 2) + 
        Math.pow(meter.y - mainMagnet.y, 2)
      );
      
      // Label the distance
      const midX = (mainMagnet.x + meter.x) / 2;
      const midY = (mainMagnet.y + meter.y) / 2;
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`${distance.toFixed(0)} pixels`, midX, midY - 10);
    }

    // Draw magnets
    magnets.forEach((magnet, index) => {
      // Draw magnet body
      ctx.beginPath();
      ctx.rect(magnet.x - 20, magnet.y - 10, 40, 20);
      ctx.fillStyle = '#8888ff';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw the poles
      if (magnet.pole === 'north') {
        // North (red) on the right
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(magnet.x, magnet.y - 10, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('N', magnet.x + 6, magnet.y + 5);
        
        // South (blue) on the left
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(magnet.x - 20, magnet.y - 10, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('S', magnet.x - 14, magnet.y + 5);
      } else {
        // South (blue) on the right
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(magnet.x, magnet.y - 10, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('S', magnet.x + 6, magnet.y + 5);
        
        // North (red) on the left
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(magnet.x - 20, magnet.y - 10, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('N', magnet.x - 14, magnet.y + 5);
      }
      
      // Magnet number
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`Magnet ${index + 1}`, magnet.x - 20, magnet.y - 15);
    });

    // Draw field strength meter
    ctx.beginPath();
    ctx.arc(meter.x, meter.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#90ee90';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.fillText('M', meter.x - 5, meter.y + 3);
  };

  const drawFieldLines = (ctx) => {
    if (magnets.length === 0) return;
    
    // Simple representation of field lines
    for (let magnet of magnets) {
      const fieldRadius = magnet.strength * 1.5;
      
      // Draw concentric circles representing field strength
      for (let r = 20; r <= fieldRadius; r += 30) {
        ctx.beginPath();
        ctx.arc(magnet.x, magnet.y, r, 0, 2 * Math.PI);
        const opacity = 0.8 - (r / fieldRadius) * 0.7;
        ctx.strokeStyle = `rgba(0, 0, 255, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  };

  const calculateFieldStrength = () => {
    if (magnets.length === 0) {
      setFieldStrength(0);
      return;
    }

    // Calculate total field strength based on distance and magnet strength
    // Using the inverse square law: B ∝ 1/r²
    let totalField = 0;
    
    magnets.forEach(magnet => {
      const distance = Math.sqrt(
        Math.pow(meter.x - magnet.x, 2) + 
        Math.pow(meter.y - magnet.y, 2)
      );
      
      // Prevent division by zero
      if (distance < 1) {
        totalField += magnet.strength;
      } else {
        totalField += magnet.strength / (distance * distance) * 10000;
      }
    });
    
    setFieldStrength(parseFloat(totalField.toFixed(2)));
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on meter
    const meterDistance = Math.sqrt(
      Math.pow(x - meter.x, 2) + Math.pow(y - meter.y, 2)
    );
    
    if (meterDistance <= 10) {
      setMeter({ ...meter, dragging: true });
      return;
    }

    // Check if clicked on any magnet
    for (let i = 0; i < magnets.length; i++) {
      const magnet = magnets[i];
      if (
        x >= magnet.x - 20 && x <= magnet.x + 20 &&
        y >= magnet.y - 10 && y <= magnet.y + 10
      ) {
        const updatedMagnets = [...magnets];
        updatedMagnets[i] = { ...magnet, dragging: true };
        setMagnets(updatedMagnets);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move meter if dragging
    if (meter.dragging) {
      setMeter({
        ...meter,
        x: Math.max(0, Math.min(canvasWidth, x)),
        y: Math.max(0, Math.min(canvasHeight, y))
      });
      return;
    }

    // Move magnet if dragging
    const updatedMagnets = magnets.map(magnet => {
      if (magnet.dragging) {
        return {
          ...magnet,
          x: Math.max(20, Math.min(canvasWidth - 20, x)),
          y: Math.max(10, Math.min(canvasHeight - 10, y))
        };
      }
      return magnet;
    });
    
    setMagnets(updatedMagnets);
  };

  const handleMouseUp = () => {
    // Release dragging states
    setMeter({ ...meter, dragging: false });
    setMagnets(magnets.map(magnet => ({ ...magnet, dragging: false })));
  };

  const addMagnet = () => {
    if (magnets.length < maxMagnets) {
      const newId = magnets.length > 0 ? Math.max(...magnets.map(m => m.id)) + 1 : 1;
      setMagnets([
        ...magnets,
        {
          id: newId,
          x: 200 + (magnets.length * 50),
          y: 250,
          strength: 100,
          dragging: false,
          pole: 'north'
        }
      ]);
    }
  };

  const removeMagnet = (id) => {
    setMagnets(magnets.filter(magnet => magnet.id !== id));
  };

  const toggleMagnetPole = (id) => {
    setMagnets(magnets.map(magnet => {
      if (magnet.id === id) {
        return {
          ...magnet,
          pole: magnet.pole === 'north' ? 'south' : 'north'
        };
      }
      return magnet;
    }));
  };

  const handleStrengthChange = (id, value) => {
    setMagnets(magnets.map(magnet => {
      if (magnet.id === id) {
        return { ...magnet, strength: parseInt(value) };
      }
      return magnet;
    }));
  };

  const startRecording = () => {
    setRecording(true);
    setDistances([]);
    setFieldStrengths([]);
    
    if (experiment === 'distance') {
      // For distance experiment, record at different distances
      const mainMagnet = magnets[0];
      const newDistances = [];
      const newFieldStrengths = [];
      
      for (let dist = 20; dist <= 300; dist += 20) {
        const angle = Math.atan2(meter.y - mainMagnet.y, meter.x - mainMagnet.x);
        const newX = mainMagnet.x + dist * Math.cos(angle);
        const newY = mainMagnet.y + dist * Math.sin(angle);
        
        // Calculate field strength at this position
        let totalField = 0;
        magnets.forEach(magnet => {
          const distance = Math.sqrt(
            Math.pow(newX - magnet.x, 2) + 
            Math.pow(newY - magnet.y, 2)
          );
          
          if (distance < 1) {
            totalField += magnet.strength;
          } else {
            totalField += magnet.strength / (distance * distance) * 10000;
          }
        });
        
        newDistances.push(dist);
        newFieldStrengths.push(parseFloat(totalField.toFixed(2)));
      }
      
      setDistances(newDistances);
      setFieldStrengths(newFieldStrengths);
    } else {
      // For multiple magnets experiment, record with increasing number of magnets
      const baseDistance = 100; // Fixed distance for measurement
      const mainMagnet = magnets[0];
      const newDistances = [];
      const newFieldStrengths = [];
      
      for (let numMagnets = 1; numMagnets <= magnets.length; numMagnets++) {
        // Calculate field strength with this many magnets
        let totalField = 0;
        for (let i = 0; i < numMagnets; i++) {
          const magnet = magnets[i];
          const distance = Math.sqrt(
            Math.pow(meter.x - magnet.x, 2) + 
            Math.pow(meter.y - magnet.y, 2)
          );
          
          if (distance < 1) {
            totalField += magnet.strength;
          } else {
            totalField += magnet.strength / (distance * distance) * 10000;
          }
        }
        
        newDistances.push(numMagnets);
        newFieldStrengths.push(parseFloat(totalField.toFixed(2)));
      }
      
      setDistances(newDistances);
      setFieldStrengths(newFieldStrengths);
    }
    
    setRecording(false);
  };

  const resetExperiment = () => {
    if (experiment === 'distance') {
      // Reset to distance experiment setup
      setMagnets([
        { id: 1, x: 300, y: 250, strength: 100, dragging: false, pole: 'north' }
      ]);
      setMeter({ x: 500, y: 250, dragging: false });
    } else {
      // Reset to multiple magnets experiment setup
      const initialMagnets = [];
      for (let i = 0; i < 3; i++) {
        initialMagnets.push({
          id: i + 1,
          x: 250 + i * 50,
          y: 250,
          strength: 100,
          dragging: false,
          pole: 'north'
        });
      }
      setMagnets(initialMagnets);
      setMeter({ x: 500, y: 250, dragging: false });
    }
    setDistances([]);
    setFieldStrengths([]);
  };

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to the Magnetic Field Simulator",
      content: "This tutorial will guide you through using this simulator to experiment with permanent magnets.",
      target: null
    },
    {
      title: "Experiment Types",
      content: "Choose between two experiment types: studying how field strength changes with distance, or how multiple magnets affect the field.",
      target: "experiment-type"
    },
    {
      title: "Field Meter",
      content: "This displays the magnetic field strength at the meter's current position in microtesla (μT).",
      target: "field-meter"
    },
    {
      title: "Simulation Area",
      content: "This is where you'll see and interact with magnets and the field meter. You can drag them to reposition.",
      target: "canvas"
    },
    {
      title: "Magnets",
      content: "The red end is the North pole and the blue end is the South pole. Drag to reposition them.",
      target: "canvas"
    },
    {
      title: "Field Meter Tool",
      content: "The green circle is your field meter. Drag it around to measure field strength at different positions.",
      target: "canvas"
    },
    {
      title: "Magnet Controls",
      content: "Add more magnets, remove them, adjust their strength, or flip their poles using these controls.",
      target: "magnet-controls"
    },
    {
      title: "Data Recording",
      content: "Click 'Record Data' to automatically collect measurements based on your experiment type.",
      target: "record-button"
    },
    {
      title: "Data Table",
      content: "View your recorded measurements here to analyze patterns and relationships.",
      target: "data-table"
    },
    {
      title: "Display Options",
      content: "Toggle field lines and distance measurements to help visualize the magnetic fields.",
      target: "display-options"
    },
    {
      title: "You're Ready!",
      content: "Explore and experiment with magnets to discover how magnetic fields behave. Click 'Close' to start experimenting.",
      target: null
    }
  ];

  // Render tutorial tooltip
  const renderTutorial = () => {
    if (!showTutorial) return null;
    
    const currentStep = tutorialSteps[tutorialStep];
    
    // Position the tooltip based on target element
    let tooltipStyle = { maxWidth: '400px' };
    let highlightStyle = {};
    
    if (currentStep.target) {
      const targetElement = document.getElementById(currentStep.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        tooltipStyle = {
          ...tooltipStyle,
          position: 'absolute',
          top: `${rect.bottom + 10}px`,
          left: `${Math.max(20, Math.min(window.innerWidth - 420, rect.left + rect.width / 2 - 200))}px`,
        };
        
        highlightStyle = {
          position: 'absolute',
          top: `${rect.top - 10}px`,
          left: `${rect.left - 10}px`,
          width: `${rect.width + 20}px`,
          height: `${rect.height + 20}px`,
          border: '3px solid #3b82f6',
          borderRadius: '8px',
          zIndex: 60,
          pointerEvents: 'none'
        };
      }
    } else {
      tooltipStyle = {
        ...tooltipStyle,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center" style={{pointerEvents: 'auto'}}>
        {currentStep.target && (
          <div style={highlightStyle} className="animate-pulse"></div>
        )}
        
        <div 
          className="bg-white rounded-lg shadow-lg p-6 z-50"
          style={tooltipStyle}
        >
          <h3 className="text-xl font-bold mb-3 text-blue-600">{currentStep.title}</h3>
          <p className="mb-6 text-gray-700">{currentStep.content}</p>
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowTutorial(false)}
            >
              Skip
            </button>
            <div>
              {tutorialStep > 0 && (
                <button 
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
                  onClick={() => setTutorialStep(tutorialStep - 1)}
                >
                  Previous
                </button>
              )}
              {tutorialStep < tutorialSteps.length - 1 ? (
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => setShowTutorial(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg relative">
      <h1 className="text-2xl font-bold mb-4">Permanent Magnet Field Simulator</h1>
      
      <div className="flex mb-4 space-x-4">
        <div id="experiment-type" className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Experiment Type</h2>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded ${experiment === 'distance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setExperiment('distance')}
            >
              Field vs Distance
            </button>
            <button 
              className={`px-3 py-1 rounded ${experiment === 'multiple' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setExperiment('multiple')}
            >
              Multiple Magnets
            </button>
          </div>
        </div>
        
        <div id="field-meter" className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Field Meter</h2>
          <div className="flex items-center">
            <span className="mr-2">Field Strength:</span>
            <span className="font-bold">{fieldStrength} μT</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <div id="canvas" className="bg-white p-2 rounded-lg shadow mb-4">
            <canvas 
              ref={canvasRef} 
              width={canvasWidth} 
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border border-gray-300"
            />
          </div>
          
          <div id="display-options" className="flex space-x-4 mb-4">
            <button 
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={resetExperiment}
            >
              Reset Experiment
            </button>
            <button 
              id="record-button"
              className="px-3 py-1 bg-green-500 text-white rounded"
              onClick={startRecording}
              disabled={recording}
            >
              Record Data
            </button>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={showFieldLines} 
                onChange={() => setShowFieldLines(!showFieldLines)}
                className="mr-2"
              />
              Show Field Lines
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={displayDistanceLine} 
                onChange={() => setDisplayDistanceLine(!displayDistanceLine)}
                className="mr-2"
              />
              Show Distance Line
            </label>
          </div>
        </div>
        
        <div className="w-64">
          <div id="magnet-controls" className="bg-white p-4 rounded-lg shadow mb-4">
            <h2 className="text-lg font-semibold mb-2">Magnets Control</h2>
            <div className="mb-2">
              <button 
                className="px-3 py-1 bg-blue-500 text-white rounded mb-2"
                onClick={addMagnet}
                disabled={magnets.length >= maxMagnets}
              >
                Add Magnet
              </button>
            </div>
            
            {magnets.map(magnet => (
              <div key={magnet.id} className="mb-3 p-2 border rounded">
                <div className="flex justify-between mb-1">
                  <span>Magnet {magnet.id}</span>
                  <div>
                    <button 
                      className="px-2 py-0.5 bg-red-500 text-white rounded text-xs mr-1"
                      onClick={() => removeMagnet(magnet.id)}
                      disabled={magnets.length === 1}
                    >
                      Remove
                    </button>
                    <button 
                      className={`px-2 py-0.5 ${magnet.pole === 'north' ? 'bg-red-500' : 'bg-blue-500'} text-white rounded text-xs`}
                      onClick={() => toggleMagnetPole(magnet.id)}
                    >
                      {magnet.pole === 'north' ? 'N→S' : 'S→N'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm">
                    Strength: {magnet.strength}
                    <input 
                      type="range"
                      min="10"
                      max="200"
                      value={magnet.strength}
                      onChange={(e) => handleStrengthChange(magnet.id, e.target.value)}
                      className="w-full"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          {distances.length > 0 && (
            <div id="data-table" className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Recorded Data</h2>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">
                        {experiment === 'distance' ? 'Distance (px)' : '# Magnets'}
                      </th>
                      <th className="text-left">Field (μT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distances.map((dist, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td>{dist}</td>
                        <td>{fieldStrengths[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Drag and drop magnets and the field meter to position them.</li>
          <li>Use the "Add Magnet" button to add more magnets (up to {maxMagnets}).</li>
          <li>Adjust strength with the sliders and flip poles with the N→S button.</li>
          <li>Switch between experiment types to study different magnetic phenomena.</li>
          <li>Click "Record Data" to collect measurements based on the current experiment.</li>
          <li>For "Field vs Distance" experiment, data is recorded at various distances from the main magnet.</li>
          <li>For "Multiple Magnets" experiment, data is recorded with increasing numbers of magnets.</li>
        </ul>
        <button
          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => {
            setTutorialStep(0);
            setShowTutorial(true);
          }}
        >
          Start Tutorial
        </button>
      </div>
      
      {/* Tutorial overlay */}
      {showTutorial && renderTutorial()}
    </div>
  );
};

export default MagnetFieldSimulator;
