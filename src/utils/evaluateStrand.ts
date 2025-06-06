// src/utils/evaluateStrand.ts - Criteria A: Knowledge and Understanding (TIR)
import { analyzeGraphImage } from './analyzeGraphImage';
import { checkTableStructure } from './checkTableStructure';

export async function evaluateStrand(
  input: string,
  experiment: 'critical-angle' | 'fiber-optics',
  strandKey: string
): Promise<{
  matchedKeywords: { label: string; level: number }[];
  matchedConcepts: { label: string; level: number }[];
  level: number;
  suggestions: string[];
}> {
  const lowerInput = input.toLowerCase();
  
  // ✅ Criteria A rubric for Total Internal Reflection
  const criteriaARubric = {
    'critical-angle': {
      strand1: { // TIR Principles & Laws
        keywords: [
          { label: "Snell's Law", level: 4, words: ["snell", "snells law", "n1 sin θ1 = n2 sin θ2"] },
          { label: "Critical Angle", level: 6, words: ["critical angle", "θc", "critical incident angle"] },
          { label: "Mathematical Formula", level: 8, words: ["sin θc = n2/n1", "sine ratio", "mathematical relationship"] }
        ],
        concepts: [
          { label: "Refraction Basics", level: 3, words: ["refraction", "bending", "light ray"] },
          { label: "Refractive Index", level: 5, words: ["refractive index", "optical density", "n value"] },
          { label: "TIR Theory", level: 7, words: ["total internal reflection", "TIR", "complete reflection"] }
        ]
      },
      strand2: { // Understanding TIR Phenomena
        keywords: [
          { label: "Incident Ray", level: 3, words: ["incident ray", "incoming light", "incident angle"] },
          { label: "Interface Behavior", level: 5, words: ["interface", "boundary", "medium boundary"] },
          { label: "Angle Relationship", level: 7, words: ["greater than critical", "exceeds critical angle", "θi > θc"] }
        ],
        concepts: [
          { label: "Medium Properties", level: 4, words: ["denser medium", "rarer medium", "optical density"] },
          { label: "TIR Conditions", level: 6, words: ["conditions for TIR", "when TIR occurs", "requirements"] },
          { label: "Physical Explanation", level: 8, words: ["cannot refract", "no transmitted ray", "energy conservation"] }
        ]
      },
      strand3: { // Real-World Applications
        keywords: [
          { label: "Optical Devices", level: 4, words: ["prism", "periscope", "binoculars"] },
          { label: "Advanced Applications", level: 6, words: ["diamond cutting", "optical instruments", "endoscope"] },
          { label: "Modern Technology", level: 8, words: ["laser surgery", "medical imaging", "precision optics"] }
        ],
        concepts: [
          { label: "Practical Uses", level: 3, words: ["everyday applications", "common uses", "practical"] },
          { label: "Scientific Applications", level: 5, words: ["scientific instruments", "research tools", "measurement"] },
          { label: "Innovation Impact", level: 7, words: ["technological advancement", "breakthrough", "innovation"] }
        ]
      },
      strand4: { // Analysis & Problem Solving
        keywords: [
          { label: "Calculation", level: 5, words: ["calculate", "compute", "numerical value"] },
          { label: "Problem Setup", level: 6, words: ["given values", "unknown variable", "solve for"] },
          { label: "Mathematical Analysis", level: 8, words: ["derive", "proof", "mathematical reasoning"] }
        ],
        concepts: [
          { label: "Data Analysis", level: 4, words: ["analyze data", "interpret results", "conclusion"] },
          { label: "Problem Solving", level: 6, words: ["systematic approach", "step by step", "methodology"] },
          { label: "Critical Thinking", level: 8, words: ["evaluate", "assess", "critical analysis"] }
        ]
      }
    },
    'fiber-optics': {
      strand1: { // Fiber Optic Principles
        keywords: [
          { label: "Optical Fiber", level: 4, words: ["optical fiber", "fiber optic", "light guide"] },
          { label: "Core-Cladding", level: 6, words: ["core", "cladding", "refractive index difference"] },
          { label: "Light Propagation", level: 8, words: ["guided wave", "mode propagation", "wave mechanics"] }
        ],
        concepts: [
          { label: "Basic Structure", level: 3, words: ["fiber structure", "cylindrical", "transparent"] },
          { label: "TIR in Fibers", level: 5, words: ["total internal reflection", "light trapping", "confinement"] },
          { label: "Wave Theory", level: 7, words: ["electromagnetic wave", "wave optics", "propagation theory"] }
        ]
      },
      strand2: { // Fiber Optic Technology
        keywords: [
          { label: "Fiber Types", level: 4, words: ["step index", "graded index", "single mode", "multimode"] },
          { label: "Technical Specs", level: 6, words: ["numerical aperture", "acceptance angle", "bandwidth"] },
          { label: "Advanced Tech", level: 8, words: ["dispersion", "attenuation", "coupling efficiency"] }
        ],
        concepts: [
          { label: "Signal Transmission", level: 3, words: ["data transmission", "signal", "information"] },
          { label: "Engineering Design", level: 5, words: ["design principles", "optimization", "performance"] },
          { label: "System Integration", level: 7, words: ["network design", "system architecture", "integration"] }
        ]
      },
      strand3: { // Applications & Impact
        keywords: [
          { label: "Communication", level: 4, words: ["telecommunications", "internet", "data communication"] },
          { label: "Medical Uses", level: 6, words: ["endoscopy", "medical imaging", "surgical applications"] },
          { label: "Emerging Tech", level: 8, words: ["quantum communication", "sensor networks", "smart systems"] }
        ],
        concepts: [
          { label: "Societal Impact", level: 3, words: ["society", "impact", "change"] },
          { label: "Economic Benefits", level: 5, words: ["cost effective", "efficiency", "economic"] },
          { label: "Future Potential", level: 7, words: ["future applications", "emerging trends", "innovation"] }
        ]
      },
      strand4: { // Design & Innovation
        keywords: [
          { label: "Design Process", level: 5, words: ["design", "development", "engineering process"] },
          { label: "Innovation", level: 6, words: ["innovative", "novel approach", "creative solution"] },
          { label: "Research", level: 8, words: ["research", "investigation", "scientific method"] }
        ],
        concepts: [
          { label: "Problem Identification", level: 4, words: ["identify problem", "need", "requirement"] },
          { label: "Solution Development", level: 6, words: ["develop solution", "prototype", "testing"] },
          { label: "Evaluation", level: 8, words: ["evaluate", "assess performance", "optimization"] }
        ]
      }
    }
  };

  const strandData = criteriaARubric[experiment]?.[strandKey];

  if (!strandData) {
    return {
      matchedKeywords: [],
      matchedConcepts: [],
      level: 0,
      suggestions: ['No rubric data found for this strand.'],
    };
  }

  let keywordLevel = 0;
  let conceptLevel = 0;
  const matchedKeywords: { label: string; level: number }[] = [];
  const matchedConcepts: { label: string; level: number }[] = [];
  const suggestions: string[] = [];

  // Check keywords
  strandData.keywords.forEach((entry) => {
    if (entry.words.some((word: string) => lowerInput.includes(word.toLowerCase()))) {
      matchedKeywords.push({ label: entry.label, level: entry.level });
      keywordLevel = Math.max(keywordLevel, entry.level);
    }
  });

  // Check concepts
  strandData.concepts.forEach((entry) => {
    if (entry.words.some((word: string) => lowerInput.includes(word.toLowerCase()))) {
      matchedConcepts.push({ label: entry.label, level: entry.level });
      conceptLevel = Math.max(conceptLevel, entry.level);
    }
  });

  // Parse input for structural evaluation
  let structureLevel = 0;
  try {
    const dom = new DOMParser().parseFromString(input, 'text/html');
    const { score: tableScore, suggestions: tableSuggestions } = checkTableStructure(dom);
    structureLevel = tableScore;
    suggestions.push(...tableSuggestions);
  } catch {
    suggestions.push('Content parsing had issues.');
  }

  // Analyze any images
  let imageLevel = 0;
  const imageMatch = input.match(/<img[^>]*src="([^"]+)"[^>]*>/);
  if (imageMatch) {
    const base64Image = imageMatch[1];
    try {
      const graphMeta = await analyzeGraphImage(base64Image, experiment);
      if (graphMeta.isGraph) {
        if (!graphMeta.axesLabeled) suggestions.push('Add axis labels to your graph.');
        if (!graphMeta.hasTitle) suggestions.push('Add a title to your graph.');
        imageLevel = graphMeta.type === 'scatter' ? 8 : 6;
      } else {
        suggestions.push('Image found, but not recognized as a graph.');
      }
    } catch {
      suggestions.push('Image analysis failed.');
    }
  }

  // Content length evaluation
  let lengthLevel = 0;
  const wordCount = input.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  if (wordCount > 150) lengthLevel = 8;
  else if (wordCount > 100) lengthLevel = 6;
  else if (wordCount > 50) lengthLevel = 4;
  else if (wordCount > 20) lengthLevel = 2;

  // Generate suggestions based on missing elements
  if (keywordLevel < 6) {
    suggestions.push(`Include more ${experiment === 'critical-angle' ? 'TIR' : 'fiber optic'} terminology.`);
  }
  if (conceptLevel < 6) {
    suggestions.push('Explain the underlying physics concepts more clearly.');
  }
  if (lengthLevel < 6) {
    suggestions.push('Expand your response with more detailed explanations.');
  }

  // Strand-specific suggestions
  const strandSuggestions = {
    strand1: [
      'Define key terms clearly',
      'Include mathematical relationships',
      'Explain the physics principles'
    ],
    strand2: [
      'Describe the phenomenon step by step',
      'Explain what happens at the interface',
      'Connect to real observations'
    ],
    strand3: [
      'Give specific examples of applications',
      'Explain how TIR is used practically',
      'Discuss the benefits and limitations'
    ],
    strand4: [
      'Show calculations with steps',
      'Analyze given data systematically',
      'Draw logical conclusions'
    ]
  };

  if (suggestions.length < 3) {
    suggestions.push(...(strandSuggestions[strandKey] || []));
  }

  // Final level calculation - weighted average
  const finalLevel = Math.round(
    (keywordLevel * 0.3 + 
     conceptLevel * 0.3 + 
     lengthLevel * 0.2 + 
     structureLevel * 0.1 + 
     imageLevel * 0.1)
  );

  return {
    matchedKeywords,
    matchedConcepts,
    level: Math.min(8, Math.max(0, finalLevel)),
    suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
  };
}