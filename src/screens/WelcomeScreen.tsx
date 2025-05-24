import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface WelcomeScreenProps {
  onStart: (name: string, experiment: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [experimentChoice, setExperimentChoice] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    const idParam = urlParams.get('studentId');

    if (nameParam && nameParam.trim()) setStudentName(nameParam);
    if (idParam && /^[0-9a-fA-F-]{36}$/.test(idParam)) {
      setStudentId(idParam);
    } else {
      console.warn('❌ Invalid or missing studentId in URL:', idParam);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-100 to-orange-400">
      <header className="bg-orange-600 text-white p-4 shadow-md">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          Scientific Lab Report Guide: MYP Criteria C
        </h1>
        <p className="text-center text-sm">Learn how to write a compelling analysis and evaluation</p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full">
          <h2 className="text-2xl font-bold text-orange-800 mb-2 text-center">
            🧲 Magnetism Lab Explorer <span className="ml-1">🧪</span>
          </h2>

          <p className="text-center text-gray-600 text-sm mb-4">
            ⏱️ <strong>Estimated Completion Time: 40 minutes</strong>
          </p>

          <p className="text-gray-700 text-sm mb-6 text-center">
            In this Criteria C activity, you'll focus on data analysis, hypothesis evaluation,
            method critique, and suggesting improvements. Master the skills needed to score
            higher in your science lab reports.
          </p>

          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">🏅 Available Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-orange-50">
                <span className="text-lg">📊</span>
                <div>
                  <p className="font-medium">Data Dynamo</p>
                  <p className="text-gray-600">Accurate tables and clear graphs</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-orange-50">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="font-medium">Ace Analyzer</p>
                  <p className="text-gray-600">Data trend + concept match</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-orange-50">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="font-medium">Hypothesis Hero</p>
                  <p className="text-gray-600">Strong hypothesis evaluation</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-orange-50">
                <span className="text-lg">🧪</span>
                <div>
                  <p className="font-medium">Method Master</p>
                  <p className="text-gray-600">Clear + safe procedure</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-orange-50">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-medium">Innovation Innovator</p>
                  <p className="text-gray-600">Smart improvement suggestions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Choose Your Experiment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setExperimentChoice('distance')}
                className={`p-4 border rounded text-left ${
                  experimentChoice === 'distance' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <p className="font-medium">Distance's Effect on Magnetic Strength</p>
                <p className="text-sm text-gray-600">How does distance affect a magnet's strength?</p>
              </button>
              <button
                onClick={() => setExperimentChoice('magnets')}
                className={`p-4 border rounded text-left ${
                  experimentChoice === 'magnets' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <p className="font-medium">Multiple Magnets' Effect on Strength</p>
                <p className="text-sm text-gray-600">How does using multiple magnets affect magnetic strength?</p>
              </button>
            </div>
          </div>

          <button
            onClick={async () => {
              if (!studentId || !studentName || !experimentChoice) return;

              const urlParams = new URLSearchParams(window.location.search);
              const sessionCode = urlParams.get('sessionCode') ?? 'unknown';

              const { error } = await supabase.from('responses').upsert({
                student_id: studentId,
                player_name: studentName,
                session_code: sessionCode,
                experiment: experimentChoice,
                updated_at: new Date().toISOString(),
              });

              if (error) {
                console.error('💥 Error syncing experiment:', error.message);
              } else {
                console.log('✅ Synced experiment choice for:', studentName);
                onStart(studentName, experimentChoice);
              }
            }}
            disabled={!studentName || !experimentChoice}
            className={`w-full py-3 rounded-lg shadow-md transition ${
              studentName && experimentChoice
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Journey
          </button>
        </div>
      </main>
    </div>
  );
};

export default WelcomeScreen;
