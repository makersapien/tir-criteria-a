// src/screens/main/SimulationPanel.tsx
import React from 'react';
import MagnetFieldSimulator from '../../components/MagnetFieldSimulator';

const SimulationPanel: React.FC = () => {
  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-primary">🔬 Simulation</h2>
      <p className="mb-4 text-sm text-gray-600">
        Use the simulator to conduct virtual experiments before recording your data in the “Your Experiment” tab.
      </p>
      <MagnetFieldSimulator />
    </div>
  );
};

export default SimulationPanel;
