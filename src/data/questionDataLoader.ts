// src/data/questionDataLoader.ts - CORRECTLY STRUCTURED

export const questionDataRaw = {
    "critical-angle": {
      "strand1": {
        "level2": [
          {
            "id": "ca_s1_l2_mcq1",
            "type": "mcq",
            "level": 2,
            "points": 2,
            "question": "What happens when light travels from a dense medium to a less dense medium?",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "basic light behavior",
            "keywords": ["refraction", "medium", "light"],
            "options": [
              {
                "id": "a",
                "text": "Light always reflects back",
                "isCorrect": false
              },
              {
                "id": "b", 
                "text": "Light bends away from the normal",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "Light travels in a straight line",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Light disappears",
                "isCorrect": false
              }
            ],
            "explanation": "When light travels from a dense medium (like glass) to a less dense medium (like air), it bends away from the normal according to Snell's law."
          },
          {
            "id": "ca_s1_l2_fill1",
            "type": "fill-blank",
            "level": 2,
            "points": 2,
            "question": "Fill in the blanks about light behavior:",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "refraction basics",
            "keywords": ["refraction", "normal", "angle"],
            "text": "When light changes direction as it passes from one medium to another, this process is called {blank}. The imaginary line perpendicular to the surface is called the {blank}.",
            "blanks": [
              {
                "id": "blank1",
                "correctAnswers": ["refraction"],
                "caseSensitive": false,
                "hints": ["Think about light bending"]
              },
              {
                "id": "blank2", 
                "correctAnswers": ["normal"],
                "caseSensitive": false,
                "hints": ["Perpendicular line to surface"]
              }
            ],
            "explanation": "Refraction is the bending of light when it passes between different media. The normal is the reference line used to measure angles of incidence and refraction."
          }
        ],
        "level4": [
          {
            "id": "ca_s1_l4_mcq1",
            "type": "mcq",
            "level": 4,
            "points": 4,
            "question": "The critical angle is the angle of incidence at which:",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "critical angle definition",
            "keywords": ["critical angle", "total internal reflection", "angle of refraction"],
            "options": [
              {
                "id": "a",
                "text": "Light is completely absorbed",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "The angle of refraction is 90°",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "Light travels parallel to the surface",
                "isCorrect": false,
                "level": 3
              },
              {
                "id": "d",
                "text": "Refraction stops completely",
                "isCorrect": false
              }
            ],
            "explanation": "The critical angle is defined as the angle of incidence for which the angle of refraction is exactly 90°. Beyond this angle, total internal reflection occurs."
          },
          {
            "id": "ca_s1_l4_short1",
            "type": "short-answer",
            "level": 4,
            "points": 4,
            "question": "Explain in simple terms what total internal reflection is.",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "TIR basics",
            "keywords": ["total internal reflection", "critical angle", "dense medium"],
            "minWords": 15,
            "maxWords": 50,
            "sampleAnswer": "Total internal reflection occurs when light traveling in a dense medium hits the boundary with a less dense medium at an angle greater than the critical angle, causing all the light to be reflected back instead of being refracted.",
            "evaluationCriteria": {
              "requiredKeywords": ["total internal reflection", "critical angle", "dense medium", "reflected"],
              "requiredConcepts": ["angle greater than critical", "all light reflected", "no refraction"]
            }
          }
        ],
        "level6": [
          {
            "id": "ca_s1_l6_match1",
            "type": "match-click",
            "level": 6,
            "points": 6,
            "question": "Match the TIR scenarios with their outcomes:",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "TIR scenarios",
            "keywords": ["angle comparison", "refraction", "reflection"],
            "leftItems": [
              {
                "id": "scenario1",
                "text": "Angle < Critical Angle"
              },
              {
                "id": "scenario2",
                "text": "Angle = Critical Angle"
              },
              {
                "id": "scenario3",
                "text": "Angle > Critical Angle"
              }
            ],
            "rightItems": [
              {
                "id": "result1",
                "text": "Light refracts into second medium"
              },
              {
                "id": "result2",
                "text": "Light refracts at 90° to normal"
              },
              {
                "id": "result3",
                "text": "Total internal reflection occurs"
              }
            ],
            "correctMatches": [
              {
                "leftId": "scenario1",
                "rightId": "result1"
              },
              {
                "leftId": "scenario2",
                "rightId": "result2"
              },
              {
                "leftId": "scenario3",
                "rightId": "result3"
              }
            ],
            "explanation": "The behavior of light at an interface depends on whether the incident angle is below, equal to, or above the critical angle."
          },
          {
            "id": "ca_s1_l6_mcq1",
            "type": "mcq",
            "level": 6,
            "points": 6,
            "question": "If the refractive index of glass is 1.5 and air is 1.0, what is the critical angle for total internal reflection?",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "critical angle calculation",
            "keywords": ["refractive index", "sin⁻¹", "critical angle"],
            "options": [
              {
                "id": "a",
                "text": "30°",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "41.8°",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "48.6°",
                "isCorrect": false,
                "level": 4
              },
              {
                "id": "d",
                "text": "60°",
                "isCorrect": false
              }
            ],
            "explanation": "Using sin(θc) = n₂/n₁ = 1.0/1.5 = 0.667, therefore θc = sin⁻¹(0.667) = 41.8°. This is the critical angle for glass-air interface."
          }
        ],
        "level8": [
          {
            "id": "ca_s1_l8_short1",
            "type": "short-answer",
            "level": 8,
            "points": 8,
            "question": "A diamond has a refractive index of 2.42. Calculate the critical angle and explain why this makes diamonds particularly brilliant and sparkly.",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "advanced TIR applications",
            "keywords": ["diamond", "brilliance", "critical angle", "total internal reflection"],
            "minWords": 60,
            "maxWords": 120,
            "sampleAnswer": "The critical angle for diamond is θc = sin⁻¹(1/2.42) = sin⁻¹(0.413) = 24.4°. This very small critical angle means that light entering a diamond is easily trapped inside through total internal reflection. Most light rays hitting the internal surfaces do so at angles greater than 24.4°, causing them to reflect internally multiple times before eventually exiting. This creates the brilliant sparkle and fire that diamonds are famous for, as light bounces around inside the stone before emerging with enhanced intensity and dispersion.",
            "evaluationCriteria": {
              "requiredKeywords": ["sin⁻¹", "24.4°", "critical angle", "total internal reflection", "brilliant"],
              "requiredConcepts": ["small critical angle", "light trapping", "multiple reflections", "sparkle"]
            }
          },
          {
            "id": "ca_s1_l8_fill1",
            "type": "fill-blank",
            "level": 8,
            "points": 8,
            "question": "Complete this advanced explanation of optical fiber operation:",
            "learningPath": "critical-angle",
            "strand": 1,
            "concept": "fiber optic principles",
            "keywords": ["optical fiber", "cladding", "core", "step-index"],
            "text": "In a step-index optical fiber, the {blank} has a higher refractive index than the {blank}, creating a step change in refractive index. Light rays that enter within the {blank} cone will undergo total internal reflection at the core-cladding boundary, ensuring efficient light guidance with minimal {blank}.",
            "blanks": [
              {
                "id": "blank1",
                "correctAnswers": ["core"],
                "caseSensitive": false
              },
              {
                "id": "blank2",
                "correctAnswers": ["cladding"],
                "caseSensitive": false
              },
              {
                "id": "blank3",
                "correctAnswers": ["acceptance", "numerical aperture"],
                "caseSensitive": false,
                "hints": ["Think about the cone of light that can enter"]
              },
              {
                "id": "blank4",
                "correctAnswers": ["loss", "attenuation"],
                "caseSensitive": false
              }
            ],
            "explanation": "The step-index design ensures efficient light guidance through TIR. The numerical aperture defines the acceptance cone for incoming light rays."
          }
        ]
      },
      "strand2": {
        "level2": [
          {
            "id": "ca_s2_l2_mcq1",
            "type": "mcq",
            "level": 2,
            "points": 2,
            "question": "When does total internal reflection occur?",
            "learningPath": "critical-angle",
            "strand": 2,
            "concept": "TIR conditions",
            "keywords": ["total internal reflection", "critical angle", "conditions"],
            "options": [
              {
                "id": "a",
                "text": "When light hits any surface",
                "isCorrect": false
              },
              {
                "id": "b", 
                "text": "When the incident angle exceeds the critical angle",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "When light travels very fast",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "When surfaces are very smooth",
                "isCorrect": false
              }
            ],
            "explanation": "Total internal reflection occurs when light traveling from a denser to less dense medium hits the interface at an angle greater than the critical angle."
          }
        ],
        "level4": [
          {
            "id": "ca_s2_l4_mcq1",
            "type": "mcq",
            "level": 4,
            "points": 4,
            "question": "What happens to light at the critical angle?",
            "learningPath": "critical-angle",
            "strand": 2,
            "concept": "critical angle behavior",
            "keywords": ["critical angle", "refracted ray", "90 degrees"],
            "options": [
              {
                "id": "a",
                "text": "Light is completely absorbed",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "The refracted ray travels at 90° to the normal",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "Light splits into many colors",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "All light is reflected back",
                "isCorrect": false
              }
            ],
            "explanation": "At the critical angle, the refracted ray emerges parallel to the interface (90° to the normal). This is the boundary condition between refraction and total internal reflection."
          }
        ],
        "level6": [
          {
            "id": "ca_s2_l6_short1",
            "type": "short-answer",
            "level": 6,
            "points": 6,
            "question": "Explain why total internal reflection only occurs when light travels from a denser to less dense medium.",
            "learningPath": "critical-angle",
            "strand": 2,
            "concept": "TIR physics explanation",
            "keywords": ["dense medium", "less dense", "snells law", "mathematical constraint"],
            "minWords": 40,
            "maxWords": 80,
            "sampleAnswer": "When light travels from dense to less dense medium, it bends away from the normal. At the critical angle, the refracted ray grazes the surface (90° to normal). Beyond this angle, Snell's law would require sin(θ₂) > 1, which is mathematically impossible. Therefore, no refraction can occur and all light is reflected. In the opposite direction, light bends toward the normal and can always be refracted.",
            "evaluationCriteria": {
              "requiredKeywords": ["dense medium", "less dense medium", "snells law", "mathematically impossible", "sin greater than 1"],
              "requiredConcepts": ["bending away from normal", "mathematical constraint", "directional requirement"]
            }
          }
        ],
        "level8": [
          {
            "id": "ca_s2_l8_short1",
            "type": "short-answer",
            "level": 8,
            "points": 8,
            "question": "Analyze how wavelength affects the critical angle and discuss the implications for white light.",
            "learningPath": "critical-angle",
            "strand": 2,
            "concept": "wavelength dependence and dispersion",
            "keywords": ["wavelength", "dispersion", "white light", "different colors", "critical angles"],
            "minWords": 80,
            "maxWords": 150,
            "sampleAnswer": "Since refractive index varies with wavelength (dispersion), different colors have slightly different critical angles. Red light has a lower refractive index than blue light in most materials, so red has a larger critical angle than blue. When white light undergoes total internal reflection, colors near the critical angle may behave differently - some may be totally reflected while others are partially transmitted. This can cause chromatic effects at the critical angle transition. In practical applications like optical fibers, this wavelength dependence contributes to chromatic dispersion, which can limit bandwidth in multimode fibers.",
            "evaluationCriteria": {
              "requiredKeywords": ["refractive index varies", "wavelength", "dispersion", "different critical angles", "chromatic effects"],
              "requiredConcepts": ["color dependence", "practical implications", "optical fiber effects", "bandwidth limitations"]
            }
          }
        ]
      }
    },
    "fiber-optics": {
      "strand1": {
        "level2": [
          {
            "id": "fo_s1_l2_mcq1",
            "type": "mcq",
            "level": 2,
            "points": 2,
            "question": "What is the main principle that allows optical fibers to work?",
            "learningPath": "fiber-optics",
            "strand": 1,
            "concept": "fiber optic basics",
            "keywords": ["optical fiber", "total internal reflection"],
            "options": [
              {
                "id": "a",
                "text": "Light amplification",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "Total internal reflection",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "Light absorption",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Light diffraction",
                "isCorrect": false
              }
            ],
            "explanation": "Optical fibers use total internal reflection to guide light along the fiber core by preventing light from escaping into the cladding."
          }
        ],
        "level4": [
          {
            "id": "fo_s1_l4_fill1",
            "type": "fill-blank",
            "level": 4,
            "points": 4,
            "question": "Label the parts of an optical fiber:",
            "learningPath": "fiber-optics",
            "strand": 1,
            "concept": "fiber structure",
            "keywords": ["core", "cladding", "coating"],
            "text": "An optical fiber consists of three main parts: the central {blank} where light travels, the {blank} which has a lower refractive index, and the protective {blank}.",
            "blanks": [
              {
                "id": "blank1",
                "correctAnswers": ["core"],
                "caseSensitive": false
              },
              {
                "id": "blank2",
                "correctAnswers": ["cladding"],
                "caseSensitive": false
              },
              {
                "id": "blank3",
                "correctAnswers": ["coating", "jacket"],
                "caseSensitive": false
              }
            ],
            "explanation": "The core guides light, the cladding provides the refractive index difference needed for TIR, and the coating protects the glass fiber."
          }
        ],
        "level6": [
          {
            "id": "fo_s1_l6_short1",
            "type": "short-answer",
            "level": 6,
            "points": 6,
            "question": "Explain how the refractive index difference between core and cladding enables light guiding in optical fibers.",
            "learningPath": "fiber-optics",
            "strand": 1,
            "concept": "refractive index and guiding",
            "keywords": ["refractive index", "core", "cladding", "critical angle"],
            "minWords": 40,
            "maxWords": 80,
            "sampleAnswer": "The core has a higher refractive index than the cladding, creating the conditions needed for total internal reflection. When light rays in the core hit the core-cladding boundary at angles greater than the critical angle, they are completely reflected back into the core. This refractive index step ensures that light is trapped and guided along the fiber length without escaping into the cladding.",
            "evaluationCriteria": {
              "requiredKeywords": ["higher refractive index", "core", "cladding", "critical angle", "trapped"],
              "requiredConcepts": ["TIR conditions", "light guiding", "refractive index step"]
            }
          }
        ],
        "level8": [
          {
            "id": "fo_s1_l8_mcq1",
            "type": "mcq",
            "level": 8,
            "points": 8,
            "question": "What is the primary advantage of single-mode fibers over multi-mode fibers for long-distance communication?",
            "learningPath": "fiber-optics",
            "strand": 1,
            "concept": "fiber types and applications",
            "keywords": ["single-mode", "multi-mode", "dispersion", "bandwidth"],
            "options": [
              {
                "id": "a",
                "text": "They can carry more light power",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "They have lower modal dispersion, allowing higher data rates",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "They are easier to manufacture",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "They work better with LED light sources",
                "isCorrect": false,
                "level": 4
              }
            ],
            "explanation": "Single-mode fibers eliminate modal dispersion because only one propagation mode is allowed. This prevents pulse broadening and enables much higher data transmission rates over long distances."
          }
        ]
      }
    }
  };
  
  export default questionDataRaw;