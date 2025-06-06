import React from 'react';
import ReactMarkdown from 'react-markdown';
import { strandExemplars, type ExemplarQuestion } from '../../data/strandExemplars'; // ✅ Import types
import { Collapse } from 'antd';
import remarkGfm from "remark-gfm";

interface GuidedExamplePanelProps {
  currentStrand: number;
  learningPathChoice?: 'critical-angle' | 'fiber-optics'; // ✅ Add learning path prop
}

const GuidedExamplePanel: React.FC<GuidedExamplePanelProps> = ({ 
  currentStrand, 
  learningPathChoice = 'critical-angle' // ✅ Default to critical-angle if not provided
}) => {
  const strandKey = `strand${currentStrand}`;
  
  // ✅ Properly type the exemplar questions with explicit type checking
  const exemplarQuestions: ExemplarQuestion[] = (() => {
    const pathData = strandExemplars?.[learningPathChoice];
    if (!pathData || typeof pathData !== 'object') return [];
    
    const strandData = pathData[strandKey as keyof typeof pathData];
    if (!strandData || !Array.isArray(strandData)) return [];
    
    return strandData as ExemplarQuestion[];
  })();

  if (exemplarQuestions.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          📚 Guided examples are being prepared for this strand. 
          Check back soon or explore the other tabs!
        </p>
      </div>
    );
  }

  // ✅ Group questions by level for better organization with proper typing
  const questionsByLevel = exemplarQuestions.reduce((acc, question) => {
    const levelKey = `Level ${question.level}`;
    if (!acc[levelKey]) acc[levelKey] = [];
    acc[levelKey].push(question);
    return acc;
  }, {} as Record<string, ExemplarQuestion[]>);

  // ✅ Get strand information for display
  const getStrandInfo = (strandNum: number, learningPath: string) => {
    const strandInfos = {
      'critical-angle': {
        1: { name: 'TIR Principles & Laws', description: 'Understanding the fundamental laws governing total internal reflection' },
        2: { name: 'Understanding TIR Phenomena', description: 'Comprehending why and when total internal reflection occurs' },
        3: { name: 'Real-World Applications', description: 'Exploring practical uses of total internal reflection in technology and nature' },
        4: { name: 'Analysis & Problem Solving', description: 'Applying mathematical and analytical skills to solve TIR problems' }
      },
      'fiber-optics': {
        1: { name: 'Fiber Optic Principles', description: 'Understanding how light travels through optical fibers' },
        2: { name: 'Fiber Optic Technology', description: 'Exploring the engineering and physics behind fiber optic systems' },
        3: { name: 'Applications & Impact', description: 'Examining fiber optic applications and their societal impact' },
        4: { name: 'Design & Innovation', description: 'Applying fiber optic principles to solve design challenges' }
      }
    };
    return strandInfos[learningPath]?.[strandNum] || { name: `Strand ${strandNum}`, description: 'Strand content' };
  };

  const strandInfo = getStrandInfo(currentStrand, learningPathChoice);

  return (
    <div className="guided-example-panel">
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-semibold text-lg mb-2 text-purple-800">
          📚 {strandInfo.name}
        </h2>
        <p className="text-gray-700 text-sm mb-3">
          {strandInfo.description}
        </p>
        <div className="bg-purple-50 p-3 rounded border border-purple-200">
          <p className="text-purple-700 text-sm">
            <strong>Learning Path:</strong> {learningPathChoice === 'critical-angle' ? 'Discovering Critical Angles' : 'How Fibre Optics Work'}
          </p>
        </div>
      </div>

      {/* Questions organized by level */}
      <Collapse
        accordion
        items={Object.entries(questionsByLevel)
          .sort(([a], [b]) => {
            const levelA = parseInt(a.replace('Level ', ''));
            const levelB = parseInt(b.replace('Level ', ''));
            return levelA - levelB;
          })
          .map(([levelKey, questions]) => ({
            key: levelKey,
            label: (
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{levelKey} Examples</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </span>
              </div>
            ),
            children: (
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">
                            {question.commandTerm.toUpperCase()}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            {question.type.replace('-', ' ')}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-2">
                          {question.question}
                        </h4>
                      </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                        <ul className="space-y-1 text-sm">
                          {question.options.map((option, optIdx) => (
                            <li 
                              key={optIdx} 
                              className={`p-2 rounded ${
                                option === question.correctAnswer 
                                  ? 'bg-green-50 border border-green-200 text-green-800' 
                                  : 'bg-gray-50'
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + optIdx)})</span> {option}
                              {option === question.correctAnswer && (
                                <span className="ml-2 text-green-600 text-xs">✓ Correct</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Correct Answer */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {question.type === 'mcq' ? 'Correct Answer:' : 'Model Answer:'}
                      </p>
                      <div className="bg-green-50 border border-green-200 p-3 rounded text-sm text-green-800">
                        {question.correctAnswer}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
                      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded">
                        {question.explanation}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Terms:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(question.keywords) && question.keywords.map((keyword, kwIdx) => (
                          <span 
                            key={kwIdx}
                            className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rubric Mapping */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Assessment Focus:</p>
                      <div className="space-y-1">
                        {Array.isArray(question.rubricMapping) && question.rubricMapping.map((mapping, mapIdx) => (
                          <div 
                            key={mapIdx}
                            className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded"
                          >
                            • {mapping}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          }))}
      />

      {/* Footer guidance */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 How to Use These Examples:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Study the <strong>command terms</strong> (define, explain, analyze) to understand what's expected</li>
          <li>• Notice how <strong>model answers</strong> use scientific vocabulary appropriately</li>
          <li>• Pay attention to the <strong>key terms</strong> that demonstrate knowledge</li>
          <li>• Use these as inspiration for your own responses in the "Your Response" tab</li>
        </ul>
      </div>
    </div>
  );
};

export default GuidedExamplePanel;