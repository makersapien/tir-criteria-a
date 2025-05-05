// utils/index.ts

export const evaluateStrand = (strandIndex, userInputs) => {
    const strandKey = `strand${strandIndex}`;
    const strand = userInputs[strandKey];
    const text = strand?.level8?.trim() || '';
    const length = text.length;
  
    if (length === 0) return 0;
    if (length <= 50) return 2;
    if (length <= 100) return 4;
    if (length <= 150) return 6;
    return 8;
  };
  
  export const awardBadge = (strandIndex, level, earnedBadges, setEarnedBadges) => {
    const newBadges = { ...earnedBadges };
  
    if (strandIndex === 1 && level >= 8) newBadges.dataDynamo = true;
    if (strandIndex === 2 && level >= 8) newBadges.aceAnalyzer = true;
    if (strandIndex === 3 && level >= 8) newBadges.hypothesisHero = true;
    if (strandIndex === 4 && level >= 8) newBadges.methodMaster = true;
    if (strandIndex === 5 && level >= 8) newBadges.innovationInnovator = true;
  
    setEarnedBadges(newBadges);
  };
  