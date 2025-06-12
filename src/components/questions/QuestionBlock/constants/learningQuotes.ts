export const LEARNING_QUOTES = [
    "Learning takes time ⏳",
    "Learning requires patience 🧘‍♀️", 
    "Understanding grows with reflection 🤔",
    "Deep learning happens slowly 🌱",
    "Take time to absorb the concepts 📚",
    "Quality learning can't be rushed ⚡",
    "Patience leads to mastery 🎯",
    "Good things take time 🕰️",
    "Every mistake is a learning opportunity 💡",
    "Knowledge builds upon itself 🏗️"
  ];
  
  export const getRandomLearningQuote = (): string => {
    return LEARNING_QUOTES[Math.floor(Math.random() * LEARNING_QUOTES.length)];
  };