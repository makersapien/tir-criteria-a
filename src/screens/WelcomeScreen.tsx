import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface WelcomeScreenProps {
  onStart: (name: string, learningPath: string) => void; // ✅ Changed from experiment to learningPath
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [learningPathChoice, setLearningPathChoice] = useState<string | null>(null); // ✅ Updated variable name

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

  const handleStartJourney = async () => {
    // ✅ Fixed validation to check learningPathChoice
    if (!studentName || !learningPathChoice) {
      alert('Please enter your name and choose a learning path');
      return;
    }

    try {
      // ✅ Updated Supabase integration for learning paths
      if (studentId) {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionCode = urlParams.get('sessionCode') ?? 'unknown';

        const { error } = await supabase.from('responses').upsert({
          student_id: studentId,
          player_name: studentName,
          session_code: sessionCode,
          experiment: learningPathChoice, // ✅ Store learning path as experiment for compatibility
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,session_code,experiment' }
        );

        if (error) {
          console.error('💥 Error syncing learning path:', error.message);
        } else {
          console.log('✅ Synced learning path choice for:', studentName);
        }
      }

      // ✅ Call onStart with learning path
      onStart(studentName, learningPathChoice);
    } catch (error) {
      console.error('Error starting journey:', error);
      alert('Failed to start journey. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 to-purple-400">
      <header className="bg-purple-600 text-white p-4 shadow-md">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          🌟 Total Internal Reflection Explorer 💎
        </h1>
        <p className="text-center text-sm">MYP Science Criteria A: Knowledge & Understanding</p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full">
          <h2 className="text-2xl font-bold text-purple-800 mb-2 text-center">
            🌟 Total Internal Reflection Explorer 💎
          </h2>

          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-purple-800 mb-2">Statement of Inquiry:</h3>
            <p className="text-purple-700 italic text-center">
              "The development of science and technology gives us the possibility of changing the world for the better."
            </p>
          </div>

          <p className="text-center text-gray-600 text-sm mb-4">
            ⏱️ <strong>Estimated Completion Time: 40 minutes</strong>
          </p>

          <p className="text-gray-700 text-sm mb-6 text-center">
            In this Criteria A activity, you'll demonstrate your knowledge and understanding of total internal reflection, 
            apply scientific principles to real-world situations, and analyze how this phenomenon enables modern 
            technologies like fiber optics.
          </p>

          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">🏅 Available Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-purple-50">
                <span className="text-lg">🔬</span>
                <div>
                  <p className="font-medium">Principle Pioneer</p>
                  <p className="text-gray-600">Master TIR laws and principles</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-purple-50">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="font-medium">Concept Crusader</p>
                  <p className="text-gray-600">Understand TIR phenomena deeply</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-purple-50">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="font-medium">Application Ace</p>
                  <p className="text-gray-600">Connect TIR to real-world uses</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 flex items-start gap-3 bg-purple-50">
                <span className="text-lg">📊</span>
                <div>
                  <p className="font-medium">Analysis Architect</p>
                  <p className="text-gray-600">Analyze and solve TIR problems</p>
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
              className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Choose Your Learning Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setLearningPathChoice('critical-angle')}
                className={`p-4 border rounded text-left transition-all ${
                  learningPathChoice === 'critical-angle' 
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔍</span>
                  <p className="font-medium text-purple-800">Discovering Critical Angles</p>
                </div>
                <p className="text-sm text-gray-600">
                  Explore how light behaves at different angles and discover the magic angle where total internal reflection begins
                </p>
              </button>
              
              <button
                onClick={() => setLearningPathChoice('fiber-optics')}
                className={`p-4 border rounded text-left transition-all ${
                  learningPathChoice === 'fiber-optics' 
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌐</span>
                  <p className="font-medium text-purple-800">How Fibre Optics Work</p>
                </div>
                <p className="text-sm text-gray-600">
                  Investigate how light travels through glass fibers and enables high-speed internet and medical procedures
                </p>
              </button>
            </div>
          </div>

          <div className="mb-6 bg-purple-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold text-purple-800 mb-2">💡 What You'll Learn:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-700">
              <div>
                <p>• Critical angle calculations</p>
                <p>• TIR in diamonds and gems</p>
                <p>• Snell's law applications</p>
              </div>
              <div>
                <p>• Refractive index applications</p>
                <p>• Fiber optic technology</p>
                <p>• Light speed in materials</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartJourney}
            disabled={!studentName || !learningPathChoice}
            className={`w-full py-3 rounded-lg shadow-md transition font-medium ${
              studentName && learningPathChoice
                ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {studentName && learningPathChoice 
              ? '🚀 Begin Learning Journey' 
              : 'Please complete all fields above'}
          </button>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <p>Debug: Name={studentName}, Path={learningPathChoice}, StudentId={studentId}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WelcomeScreen;