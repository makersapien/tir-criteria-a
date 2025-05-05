export interface LevelDescriptor {
  level: string;
  title: string;
  markdown: string;
}

export interface StrandContent {
  strandName: string;
  strandDescription: string;
  levels: LevelDescriptor[];
}

const strandExemplars: StrandContent[] = [
  {
    strandName: "Data Collection & Presentation",
    strandDescription:
      "Students should collect sufficient, relevant quantitative and/or qualitative data and record it appropriately using tables, charts, or diagrams with correct units and labels. They must present data clearly using effective formats like graphs.",
    levels: [
      {
        level: "3-4",
        title: "Level 3-4: Basic Data",
        markdown: `
- Partial data recorded with errors  
- Little use of headings or organization  
- Graphs or tables may be missing or incorrect  
- Units may be missing  
- No evidence of trials  

**Example Table:**  
| Temperature (°C) | Paperclips Picked |
|------------------|-------------------|
| 10               | 7                 |
| 30               | 5                 |
| 50               | 4                 |
| 70               | 2                 |
        `.trim(),
      },
      {
        level: "5-6",
        title: "Level 5-6: Sufficient Data",
        markdown: `
- Sufficient data for analysis  
- Mostly correct tables and graphs  
- Some organization, minor errors  

![Level 6 Graph](/images/strand1_level4_graph.png)
![Level 4 Table](/images/strand1_level6_graph.png)

        `.trim(),
      },
      {
        level: "7-8",
        title: "Level 7-8: Complete & Correct",
        markdown: `
- All data recorded precisely with appropriate units  
- Neat, labeled tables and accurate graphs  
- Logical, consistent presentation style  

**Sample Graph:**  
![Level 8 Graph](/images/strand1_level8_graph.png)
        `.trim(),
      },
    ],
  },

  {
    strandName: "Data Analysis",
    strandDescription:
      "Students should process and interpret data using suitable techniques. Trends, patterns, and relationships must be identified clearly. Errors or anomalies should be explained using scientific reasoning.",
    levels: [
      {
        level: "3-4",
        title: "Level 3-4: Basic Analysis",
        markdown: `
- General trends identified  
- Some incorrect interpretations  
- Graphs may not support conclusions
        `.trim(),
      },
      {
        level: "5-6",
        title: "Level 5-6: Reasonable Analysis",
        markdown: `
- Accurate trends and averages  
- Some linking to variables  
- Somewhat supported conclusions
        `.trim(),
      },
      {
        level: "7-8",
        title: "Level 7-8: Detailed & Insightful",
        markdown: `
- Mathematical patterns (e.g. inverse relationship) clearly explained  
- Strong connection to variables and physics laws  
- Graphs fully support claims
        `.trim(),
      },
    ],
  },

  {
    strandName: "Hypothesis Evaluation",
    strandDescription:
      "Students must compare experimental data with their hypothesis and evaluate if it was correct, using scientific reasoning. High levels require justification using principles like magnetic domains or inverse square law.",
    levels: [
      {
        level: "3-4",
        title: "Level 3-4: Simple Evaluation",
        markdown: `
- Statement of whether hypothesis was correct  
- No reasoning  
- No physics explanation
        `.trim(),
      },
      {
        level: "5-6",
        title: "Level 5-6: Reasoned Evaluation",
        markdown: `
- Explains result using data or trend  
- Some scientific justification  
- Links to hypothesis
        `.trim(),
      },
      {
        level: "7-8",
        title: "Level 7-8: Scientific Evaluation",
        markdown: `
- Detailed explanation using scientific principles  
- Links to domains, magnetic strength, inverse square law  
- Comprehensive justification of hypothesis correctness
        `.trim(),
      },
    ],
  },

  {
    strandName: "Methodology Evaluation",
    strandDescription:
      "Students should reflect on how the method used influenced the results. They must identify flaws or sources of error and suggest improvements based on scientific reasoning.",
    levels: [
      {
        level: "3-4",
        title: "Level 3-4: General Description",
        markdown: `
- Method is described  
- Few flaws identified  
- Some vague comments about accuracy or safety
        `.trim(),
      },
      {
        level: "5-6",
        title: "Level 5-6: Focused Critique",
        markdown: `
- Points out limitations (e.g. uneven spacing, zero error)  
- Suggests improvements (e.g. digital sensor)  
- General awareness of accuracy
        `.trim(),
      },
      {
        level: "7-8",
        title: "Level 7-8: Thorough Evaluation",
        markdown: `
- Evaluates method's effect on results  
- Suggests detailed improvements  
- Applies scientific understanding to critique
        `.trim(),
      },
    ],
  },

  {
    strandName: "Suggestion & Improvement",
    strandDescription:
      "Students must propose improvements or extensions for the experiment. Suggestions should be scientifically justified and clearly related to the conclusion and limitations.",
    levels: [
      {
        level: "3-4",
        title: "Level 3-4: Basic Suggestion",
        markdown: `
- Mentions general idea (e.g. test more distances)  
- Not clearly related to the data  
- No purpose or reasoning
        `.trim(),
      },
      {
        level: "5-6",
        title: "Level 5-6: Connected Suggestion",
        markdown: `
- Suggestion linked to results (e.g. add magnet types)  
- Some reasoning or purpose provided
        `.trim(),
      },
      {
        level: "7-8",
        title: "Level 7-8: Purposeful Improvement",
        markdown: `
- Scientifically justified new question  
- Connected to conclusion and limitations  
- Realistic and testable
        `.trim(),
      },
    ],
  },
];

export default strandExemplars;
