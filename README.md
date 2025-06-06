# Total Internal Reflection - Criteria A Explorer

🔬 **Interactive MYP Physics Learning Platform**

An engaging, gamified learning experience for students to master Total Internal Reflection (TIR) concepts through interactive questions, simulations, and real-time assessment.

## 🎯 Features

### **Criteria A Focus**
- **Knowledge & Understanding** assessment aligned with MYP Physics
- **Interactive question blocks** with adaptive difficulty (Levels 2, 4, 6, 8)
- **Real-time evaluation** with instant feedback and suggestions
- **Progressive learning** through scaffolded content delivery

### **Learning Paths**
1. **Critical Angle Investigations** - Understanding the physics of TIR
2. **Fiber Optics Applications** - Real-world applications and technology

### **Advanced Assessment**
- **Multi-modal questions**: MCQ, Fill-blanks, Short answers, Matching
- **Intelligent scoring** with partial credit and concept recognition
- **Live progress tracking** with achievement badges
- **Detailed analytics** for educators and students

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager

### **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/tir-criteria-a.git
cd tir-criteria-a

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Deployment**
```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── questions/           # Question type components
│   │   ├── MCQComponent.tsx
│   │   ├── FillBlankComponent.tsx
│   │   ├── ShortAnswerComponent.tsx
│   │   └── MatchClickComponent.tsx
│   ├── YourResponseSection.tsx  # Main question interface
│   └── RichEditor.tsx          # Content creation tools
├── data/
│   ├── questionData.json       # Question bank
│   └── strandRubric.json      # Assessment criteria
├── hooks/
│   └── useQuestionStrandSync.ts # Supabase integration
├── types/
│   └── questionBlock.ts        # TypeScript definitions
└── utils/
    └── evaluateStrand.ts       # Assessment algorithms
```

## 🎮 Usage

### **For Students**
1. **Select Learning Path**: Choose between Critical Angle or Fiber Optics
2. **Progress Through Levels**: Complete questions at your pace
3. **Get Instant Feedback**: Learn from detailed explanations
4. **Track Achievement**: Earn badges and see progress

### **For Educators**
- **Real-time Monitoring**: Track student progress live
- **Detailed Analytics**: See performance by strand and concept
- **Customizable Content**: Modify questions and assessment criteria
- **Export Reports**: Generate detailed progress reports

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Assessment**: Custom evaluation algorithms
- **Backend**: Supabase (real-time data sync)
- **Deployment**: Vite, GitHub Pages

## 📊 Assessment Framework

### **MYP Criteria A Alignment**
- **Level 2**: Basic recall and simple understanding
- **Level 4**: Application in familiar contexts  
- **Level 6**: Analysis and evaluation in new contexts
- **Level 8**: Synthesis and creation of understanding

### **Evaluation Methods**
- **Keyword Recognition**: Concept-based scoring
- **Partial Credit**: Nuanced assessment beyond right/wrong
- **Adaptive Feedback**: Personalized suggestions for improvement
- **Progress Tracking**: Detailed analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MYP Framework** for assessment criteria
- **Educational Research** on adaptive learning systems
- **Open Source Community** for excellent tools and libraries

---

**Built with ❤️ for MYP Physics Education**