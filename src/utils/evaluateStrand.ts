// src/utils/evaluateStrand.ts
import rubric from '../data/strandRubric.json';
import { analyzeGraphImage } from './analyzeGraphImage';
import { checkTableStructure } from './checkTableStructure';
import exemplarAnswers from '../data/exemplarAnswers.json';
import suggestionsBank from '../data/suggestions.json';

export async function evaluateStrand(
  input: string,
  experiment: 'distance' | 'magnets',
  strandKey: string
): Promise<{
  matchedKeywords: { label: string; level: number }[];
  matchedConcepts: { label: string; level: number }[];
  level: number;
  suggestions: string[];
}> {
  const lowerInput = input.toLowerCase();
  const strandData = rubric?.experiments?.[experiment]?.strands?.[strandKey];

  if (!strandData || !Array.isArray(strandData.keywords) || !Array.isArray(strandData.concepts)) {
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

  strandData.keywords.forEach((entry) => {
    if (entry.words.some((word: string) => lowerInput.includes(word.toLowerCase()))) {
      matchedKeywords.push({ label: entry.label, level: entry.level });
      keywordLevel = Math.max(keywordLevel, entry.level);
    }
  });

  strandData.concepts.forEach((entry) => {
    if (entry.words.some((word: string) => lowerInput.includes(word.toLowerCase()))) {
      matchedConcepts.push({ label: entry.label, level: entry.level });
      conceptLevel = Math.max(conceptLevel, entry.level);
    }
  });

  // Parse input string to DOM for structural evaluation
  let structureLevel = 0;
  try {
    const dom = new DOMParser().parseFromString(input, 'text/html');
    const { score: tableScore, suggestions: tableSuggestions } = checkTableStructure(dom);
    structureLevel = tableScore;
    suggestions.push(...tableSuggestions);
  } catch {
    suggestions.push('Table parsing failed.');
  }

  // Analyze graph image
  let imageLevel = 0;
  const imageMatch = input.match(/<img[^>]*src="([^"]+)"[^>]*>/);
  if (imageMatch) {
    const base64Image = imageMatch[1];
    const graphMeta = await analyzeGraphImage(base64Image, experiment);

    if (graphMeta.isGraph) {
      if (!graphMeta.axesLabeled) suggestions.push('Add axis labels to your graph.');
      if (!graphMeta.hasTitle) suggestions.push('Add a title to your graph.');

      if (graphMeta.type === 'scatter') {
        imageLevel = 8;
      } else if (graphMeta.type === 'bar') {
        imageLevel = 6;
        suggestions.push('Scatter plot is preferred for Level 7–8.');
      } else {
        imageLevel = 4;
      }
    } else {
      suggestions.push('Image found, but it’s not recognized as a graph.');
    }
  } else {
    suggestions.push('No graph image found. Consider uploading one.');
  }

  // Additional logic for strands 2–5 (Exemplar + Suggestions)
  let exemplarScore = 0;
  if (strandKey !== 'strand1') {
    const exemplars = exemplarAnswers?.[experiment]?.[strandKey] || {};
    const expectedPhrases = Object.entries(exemplars).flatMap(([level, phrases]: [string, any]) =>
      Array.isArray(phrases) ? phrases.map((phrase) => ({ level: parseInt(level), phrase })) : []
    );

    for (const { level, phrase } of expectedPhrases) {
      if (lowerInput.includes(phrase.toLowerCase())) {
        exemplarScore = Math.max(exemplarScore, level);
      }
    }

    // Suggestions
    const levelSuggestions = suggestionsBank?.[experiment]?.[strandKey] || {};
    const topMissing: string[] = Object.values(levelSuggestions || {}).flat() as string[];

    if (topMissing?.length > 0) {
      suggestions.push(...topMissing.slice(0, 3));
    }
  }

  const finalLevel =
    strandKey === 'strand1'
      ? Math.round(
          (keywordLevel * 0.25 +
            conceptLevel * 0.25 +
            structureLevel * 0.25 +
            imageLevel * 0.25)
        )
      : Math.round(
          (keywordLevel * 0.25 +
            conceptLevel * 0.25 +
            exemplarScore * 0.25 +
            structureLevel * 0.25)
        );

  return {
    matchedKeywords,
    matchedConcepts,
    level: finalLevel,
    suggestions,
  };
}
