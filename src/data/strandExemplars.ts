export interface ExemplarQuestion {
  id: string;
  type: 'mcq' | 'fill-blank' | 'short-answer' | 'calculation' | 'extended-response' | 'diagram-analysis';
  level: number;
  commandTerm: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  keywords: string[];
  rubricMapping: string[];
}

export const strandExemplars = {
  'critical-angle': {
    strand1: [
      // Level 2 - Basic Facts
      {
        id: 'ca-s1-l2-1',
        type: 'mcq' as const,
        level: 2,
        commandTerm: 'define',
        question: 'Define total internal reflection.',
        options: [
          'When light bounces off a surface',
          'When light completely reflects at a boundary between two media',
          'When light bends as it passes through materials',
          'When light splits into different colors'
        ],
        correctAnswer: 'When light completely reflects at a boundary between two media',
        explanation: 'Total internal reflection occurs when light traveling from a denser to less dense medium is completely reflected at the boundary.',
        keywords: ['total internal reflection', 'reflect', 'boundary', 'media'],
        rubricMapping: ['States basic scientific facts', 'Uses simple scientific vocabulary']
      },
      {
        id: 'ca-s1-l2-2',
        type: 'fill-blank' as const,
        level: 2,
        commandTerm: 'state',
        question: 'Complete: The _______ angle is the minimum angle of incidence for total internal reflection to occur.',
        options: [],
        correctAnswer: 'critical',
        explanation: 'The critical angle is the specific angle of incidence at which total internal reflection begins.',
        keywords: ['critical angle', 'angle of incidence', 'minimum'],
        rubricMapping: ['States basic scientific facts']
      },
      // Level 4 - Adequate Understanding  
      {
        id: 'ca-s1-l4-1',
        type: 'short-answer' as const,
        level: 4,
        commandTerm: 'describe',
        question: 'Describe the conditions required for total internal reflection to occur.',
        options: [],
        correctAnswer: 'Light must travel from a denser medium (higher refractive index) to a less dense medium (lower refractive index), and the angle of incidence must be greater than the critical angle.',
        explanation: 'TIR requires specific conditions: direction from dense to less dense medium and incident angle exceeding critical angle.',
        keywords: ['dense medium', 'less dense medium', 'refractive index', 'angle of incidence', 'critical angle'],
        rubricMapping: ['Describes scientific concepts clearly', 'Uses appropriate scientific terminology']
      },
      {
        id: 'ca-s1-l4-2',
        type: 'mcq' as const,
        level: 4,
        commandTerm: 'identify',
        question: 'Identify which equation correctly represents the critical angle formula.',
        options: [
          'sin(θc) = n₁/n₂',
          'sin(θc) = n₂/n₁', 
          'cos(θc) = n₂/n₁',
          'tan(θc) = n₁/n₂'
        ],
        correctAnswer: 'sin(θc) = n₂/n₁',
        explanation: 'The critical angle formula is sin(θc) = n₂/n₁ where n₁ is the denser medium and n₂ is the less dense medium.',
        keywords: ['critical angle', 'formula', 'sine', 'refractive index'],
        rubricMapping: ['Shows understanding of relationships between concepts']
      },
      // Level 6 - Substantial Understanding
      {
        id: 'ca-s1-l6-1',
        type: 'calculation' as const,
        level: 6,
        commandTerm: 'calculate',
        question: 'Calculate the critical angle for light traveling from glass (n = 1.5) to air (n = 1.0). Show your work.',
        options: [],
        correctAnswer: 'θc = arcsin(1.0/1.5) = arcsin(0.667) = 41.8°',
        explanation: 'Using sin(θc) = n₂/n₁ = 1.0/1.5 = 0.667, therefore θc = arcsin(0.667) = 41.8°',
        keywords: ['calculate', 'critical angle', 'glass', 'air', 'refractive index', 'arcsin'],
        rubricMapping: ['Applies knowledge to solve problems', 'Demonstrates comprehensive understanding']
      },
      {
        id: 'ca-s1-l6-2',
        type: 'short-answer' as const,
        level: 6,
        commandTerm: 'explain',
        question: 'Explain why total internal reflection only occurs when light travels from a denser to less dense medium.',
        options: [],
        correctAnswer: 'When light travels from dense to less dense medium, it bends away from the normal. At the critical angle, the refracted ray grazes the surface (90° to normal). Beyond this angle, no refraction is possible, so all light is reflected. In the opposite direction (less dense to more dense), light bends toward the normal and can always be refracted.',
        explanation: 'The physics of refraction and Snells law determine that TIR is only possible in one direction due to the bending behavior of light.',
        keywords: ['dense medium', 'less dense medium', 'refraction', 'normal', 'snells law'],
        rubricMapping: ['Explains scientific phenomena using theories', 'Comprehensive understanding of concepts']
      },
      // Level 8 - Excellent Understanding
      {
        id: 'ca-s1-l8-1',
        type: 'extended-response' as const,
        level: 8,
        commandTerm: 'analyze',
        question: 'Analyze how the critical angle would change if you increased the refractive index difference between two media. Discuss the implications for optical fiber design.',
        options: [],
        correctAnswer: 'Increasing the refractive index difference (n₁ - n₂) decreases the critical angle because sin(θc) = n₂/n₁ becomes smaller. This means light can be trapped at smaller incident angles, making the fiber more efficient at capturing and guiding light. However, very high index differences can cause modal dispersion and signal distortion. Optimal fiber design balances light-gathering ability with signal quality, typically using step-index or graded-index profiles.',
        explanation: 'This demonstrates sophisticated understanding of the relationship between material properties and optical performance.',
        keywords: ['refractive index difference', 'critical angle', 'optical fiber', 'modal dispersion', 'signal quality'],
        rubricMapping: ['Analyzes complex scenarios', 'Synthesizes knowledge from multiple sources', 'Sophisticated understanding']
      }
    ],
    strand2: [
      // Level 2
      {
        id: 'ca-s2-l2-1',
        type: 'mcq' as const,
        level: 2,
        commandTerm: 'identify',
        question: 'Identify when total internal reflection occurs.',
        options: [
          'When light hits any surface',
          'When the incident angle is very small', 
          'When the incident angle exceeds the critical angle',
          'When light travels through the same medium'
        ],
        correctAnswer: 'When the incident angle exceeds the critical angle',
        explanation: 'TIR only occurs when the angle of incidence is greater than the critical angle.',
        keywords: ['incident angle', 'critical angle', 'exceeds'],
        rubricMapping: ['States basic scientific facts']
      },
      // Level 4
      {
        id: 'ca-s2-l4-1',
        type: 'short-answer' as const,
        level: 4,
        commandTerm: 'describe',
        question: 'Describe what happens to light at the critical angle.',
        options: [],
        correctAnswer: 'At the critical angle, the refracted ray travels along the boundary between the two media at 90° to the normal. This is the transition point between refraction and total internal reflection.',
        explanation: 'The critical angle represents the boundary condition where the refracted ray just grazes the surface.',
        keywords: ['critical angle', 'refracted ray', 'boundary', 'normal', '90 degrees'],
        rubricMapping: ['Describes scientific concepts clearly', 'Appropriate scientific terminology']
      },
      // Level 6
      {
        id: 'ca-s2-l6-1',
        type: 'diagram-analysis' as const,
        level: 6,
        commandTerm: 'explain',
        question: 'Explain why light rays with incident angles less than the critical angle undergo both reflection and refraction, while rays above the critical angle only reflect.',
        options: [],
        correctAnswer: 'Below the critical angle, Snells law can be satisfied (n₁sin(θ₁) = n₂sin(θ₂)) because sin(θ₂) < 1. Some light energy is transmitted (refracted) and some is reflected. Above the critical angle, Snells law would require sin(θ₂) > 1, which is mathematically impossible. Therefore, no light can be transmitted and all energy is reflected.',
        explanation: 'This demonstrates understanding of the mathematical constraints that govern optical phenomena.',
        keywords: ['snells law', 'reflection', 'refraction', 'mathematical constraint', 'energy'],
        rubricMapping: ['Explains scientific phenomena using theories', 'Applies knowledge to solve problems']
      },
      // Level 8
      {
        id: 'ca-s2-l8-1',
        type: 'extended-response' as const,
        level: 8,
        commandTerm: 'evaluate',
        question: 'Evaluate the factors that affect the critical angle and discuss how these principles are applied in the design of optical devices.',
        options: [],
        correctAnswer: 'The critical angle depends solely on the refractive indices of the two media (θc = arcsin(n₂/n₁)). Key factors include: 1) Material selection - higher index contrast creates smaller critical angles and better light confinement, 2) Wavelength dependence - dispersion causes different colors to have slightly different critical angles, 3) Temperature effects - refractive indices change with temperature, affecting critical angles. These principles are applied in: optical fibers (core-cladding index difference), prisms (precise angle cutting for total reflection), LED design (light extraction efficiency), and waveguides (mode confinement). Successful optical device design requires balancing these factors against cost, manufacturing constraints, and performance requirements.',
        explanation: 'This demonstrates comprehensive analysis of multiple interrelated factors and their practical applications.',
        keywords: ['refractive indices', 'material selection', 'wavelength dependence', 'temperature effects', 'optical devices'],
        rubricMapping: ['Analyzes complex scenarios', 'Evaluates theories critically', 'Synthesizes knowledge', 'Sophisticated understanding']
      }
    ],
    strand3: [
      // Level 2
      {
        id: 'ca-s3-l2-1',
        type: 'mcq' as const,
        level: 2,
        commandTerm: 'list',
        question: 'List which of these uses total internal reflection.',
        options: [
          'Mirrors',
          'Glass windows',
          'Optical fibers',
          'Camera lenses'
        ],
        correctAnswer: 'Optical fibers',
        explanation: 'Optical fibers rely on total internal reflection to guide light through the fiber core.',
        keywords: ['optical fibers', 'total internal reflection'],
        rubricMapping: ['States basic scientific facts']
      },
      // Level 4
      {
        id: 'ca-s3-l4-1',
        type: 'short-answer' as const,
        level: 4,
        commandTerm: 'describe',
        question: 'Describe how diamonds use total internal reflection to create brilliance.',
        options: [],
        correctAnswer: 'Diamonds have a very high refractive index (2.42), which creates a small critical angle. Light entering the diamond undergoes multiple total internal reflections, bouncing around inside before exiting. This traps light and creates the sparkling brilliance diamonds are known for.',
        explanation: 'High refractive index materials can trap light effectively through multiple internal reflections.',
        keywords: ['diamond', 'high refractive index', '2.42', 'critical angle', 'brilliance', 'sparkling'],
        rubricMapping: ['Describes benefits in applications', 'Uses appropriate terminology']
      },
      // Level 6
      {
        id: 'ca-s3-l6-1',
        type: 'short-answer' as const,
        level: 6,
        commandTerm: 'explain',
        question: 'Explain how fiber optic internet cables use total internal reflection to transmit data over long distances.',
        options: [],
        correctAnswer: 'Fiber optic cables consist of a high refractive index glass core surrounded by lower index cladding. Light signals representing digital data are injected into the core at angles exceeding the critical angle. The light undergoes total internal reflection at the core-cladding boundary, bouncing down the length of the fiber with minimal loss. This allows data transmission over kilometers without significant signal degradation, enabling high-speed internet connectivity.',
        explanation: 'This shows understanding of how TIR principles enable practical technology applications.',
        keywords: ['fiber optic cables', 'core', 'cladding', 'refractive index', 'digital data', 'signal transmission'],
        rubricMapping: ['Explains physics behind applications', 'Comprehensive understanding']
      },
      // Level 8
      {
        id: 'ca-s3-l8-1',
        type: 'extended-response' as const,
        level: 8,
        commandTerm: 'analyze',
        question: 'Analyze the advantages and limitations of using total internal reflection in medical endoscopy compared to traditional imaging methods.',
        options: [],
        correctAnswer: 'TIR-based endoscopy offers several advantages: 1) Flexibility - fiber bundles can bend around corners while maintaining image quality, 2) Minimal invasiveness - thin fibers require smaller incisions, 3) Light efficiency - TIR preserves light intensity for better illumination, 4) Multi-functionality - separate fibers can carry light in and images out. Limitations include: 1) Resolution constraints - fiber diameter limits pixel count, 2) Coherent bundle requirements - fibers must maintain spatial relationships, 3) Fragility - glass fibers can break with excessive bending, 4) Cost - precision manufacturing is expensive. Compared to traditional methods like X-rays or external cameras, endoscopy provides real-time internal visualization but with trade-offs in image resolution and equipment complexity. Recent developments in gradient-index fibers and digital processing are addressing some limitations.',
        explanation: 'This demonstrates sophisticated analysis of technological applications with critical evaluation of trade-offs.',
        keywords: ['endoscopy', 'fiber bundles', 'flexibility', 'resolution', 'coherent bundle', 'gradient-index'],
        rubricMapping: ['Analyzes multiple applications', 'Evaluates effectiveness and limitations', 'Critical evaluation']
      }
    ],
    strand4: [
      // Level 2
      {
        id: 'ca-s4-l2-1',
        type: 'calculation' as const,
        level: 2,
        commandTerm: 'calculate',
        question: 'Calculate the critical angle when n₁ = 1.4 and n₂ = 1.0 (given: sin⁻¹(0.714) = 45.6°)',
        options: [],
        correctAnswer: '45.6°',
        explanation: 'Using the given inverse sine value, θc = sin⁻¹(n₂/n₁) = sin⁻¹(1.0/1.4) = sin⁻¹(0.714) = 45.6°',
        keywords: ['critical angle', 'calculate', 'inverse sine'],
        rubricMapping: ['Performs simple calculations with given formulas']
      },
      // Level 4
      {
        id: 'ca-s4-l4-1',
        type: 'calculation' as const,
        level: 4,
        commandTerm: 'determine',
        question: 'Determine the refractive index of glass if the critical angle for glass-air interface is 42°.',
        options: [],
        correctAnswer: 'n = 1.49',
        explanation: 'Using sin(θc) = n₂/n₁, we have sin(42°) = 1.0/n₁, so n₁ = 1.0/sin(42°) = 1.0/0.669 = 1.49',
        keywords: ['refractive index', 'determine', 'glass-air interface'],
        rubricMapping: ['Solves basic TIR problems', 'Uses appropriate equations']
      },
      // Level 6
      {
        id: 'ca-s4-l6-1',
        type: 'calculation' as const,
        level: 6,
        commandTerm: 'analyze',
        question: 'Analyze this scenario: Light travels from water (n=1.33) to glass (n=1.5) at 45°. Will total internal reflection occur? Show calculations and explain.',
        options: [],
        correctAnswer: 'No, TIR will not occur. TIR requires light to travel from higher to lower refractive index (n₁ > n₂). Here, light travels from water (n=1.33) to glass (n=1.5), so n₁ < n₂. The light will refract toward the normal according to Snells law: n₁sin(θ₁) = n₂sin(θ₂), so 1.33×sin(45°) = 1.5×sin(θ₂), giving θ₂ = 38.9°.',
        explanation: 'This demonstrates understanding that TIR direction matters and ability to apply Snells law when TIR does not occur.',
        keywords: ['water', 'glass', 'refractive index', 'snells law', 'refraction'],
        rubricMapping: ['Analyzes complex scenarios', 'Calculates multiple variables']
      },
      // Level 8
      {
        id: 'ca-s4-l8-1',
        type: 'extended-response' as const,
        level: 8,
        commandTerm: 'evaluate',
        question: 'Evaluate an experimental design to measure the critical angle of an unknown liquid. Include sources of error and suggest improvements.',
        options: [],
        correctAnswer: 'Experimental setup: Place liquid in semicircular container, use laser pointer to direct light from liquid to air at various angles, measure incident angles where TIR begins. Sources of error: 1) Angle measurement precision - use digital protractor, 2) Surface quality - ensure clean liquid-air interface, 3) Temperature effects - control temperature as refractive index varies with temperature, 4) Laser beam width - use narrow beam for precise angle definition, 5) Multiple reflections - use black absorbing surfaces. Improvements: 1) Automated angle adjustment with stepper motor, 2) Digital imaging to detect TIR onset, 3) Multiple measurements and statistical analysis, 4) Temperature monitoring and correction, 5) Use of different wavelengths to study dispersion. Expected accuracy: ±0.5° with careful technique, allowing refractive index determination to ±0.01.',
        explanation: 'This demonstrates sophisticated experimental design thinking and understanding of practical measurement challenges.',
        keywords: ['experimental design', 'measurement precision', 'sources of error', 'improvements', 'accuracy'],
        rubricMapping: ['Evaluates experimental designs', 'Synthesizes solutions to novel problems']
      }
    ]
  },
  'fiber-optics': {
    strand1: [
      // Level 2
      {
        id: 'fo-s1-l2-1',
        type: 'mcq' as const,
        level: 2,
        commandTerm: 'identify',
        question: 'Identify the main components of an optical fiber.',
        options: [
          'Core and coating',
          'Core and cladding', 
          'Wire and insulation',
          'Glass and plastic'
        ],
        correctAnswer: 'Core and cladding',
        explanation: 'Optical fibers consist of a high refractive index core surrounded by lower refractive index cladding.',
        keywords: ['core', 'cladding', 'optical fiber'],
        rubricMapping: ['States basic components']
      },
      // Level 4
      {
        id: 'fo-s1-l4-1',
        type: 'short-answer' as const,
        level: 4,
        commandTerm: 'describe',
        question: 'Describe how light is kept inside the core of an optical fiber.',
        options: [],
        correctAnswer: 'Light is trapped in the fiber core by total internal reflection. The core has a higher refractive index than the cladding, so light hitting the core-cladding boundary at angles greater than the critical angle undergoes total internal reflection and bounces along the fiber.',
        explanation: 'This shows understanding of the basic principle behind optical fiber operation.',
        keywords: ['trapped', 'total internal reflection', 'core', 'cladding', 'refractive index', 'critical angle'],
        rubricMapping: ['Describes how light travels through fibers']
      },
      // Level 6
      {
        id: 'fo-s1-l6-1',
        type: 'calculation' as const,
        level: 6,
        commandTerm: 'calculate',
        question: 'Calculate the numerical aperture of a step-index fiber with core index n₁ = 1.48 and cladding index n₂ = 1.46.',
        options: [],
        correctAnswer: 'NA = 0.242',
        explanation: 'Numerical aperture NA = √(n₁² - n₂²) = √(1.48² - 1.46²) = √(2.1904 - 2.1316) = √0.0588 = 0.242',
        keywords: ['numerical aperture', 'step-index fiber', 'core index', 'cladding index'],
        rubricMapping: ['Applies knowledge to solve problems', 'Uses fiber optic equations']
      },
      // Level 8
      {
        id: 'fo-s1-l8-1',
        type: 'extended-response' as const,
        level: 8,
        commandTerm: 'analyze',
        question: 'Analyze the trade-offs between single-mode and multimode fibers for different applications.',
        options: [],
        correctAnswer: 'Single-mode fibers have very small cores (~9μm) that support only one light propagation mode, eliminating modal dispersion and enabling high-bandwidth, long-distance transmission. They require expensive laser sources and precise alignment but offer superior performance for telecommunications. Multimode fibers have larger cores (50-100μm) supporting multiple light paths, making them easier to couple and cheaper to install, but modal dispersion limits bandwidth and distance. Step-index multimode fibers have higher dispersion than graded-index types. Applications: single-mode for long-haul telecommunications and high-speed data networks; multimode for short-distance applications like LANs, data centers, and building networks where cost and ease of installation outweigh bandwidth limitations.',
        explanation: 'This demonstrates comprehensive understanding of fiber types and their optimal applications.',
        keywords: ['single-mode', 'multimode', 'modal dispersion', 'bandwidth', 'telecommunications', 'applications'],
        rubricMapping: ['Analyzes different fiber types', 'Evaluates trade-offs comprehensively']
      }
    ],
    strand2: [
      // Level 2-8 examples for other strands...
      {
        id: 'fo-s2-l2-1',
        type: 'mcq' as const,
        level: 2,
        commandTerm: 'identify',
        question: 'Identify what converts electrical signals to light in fiber optic systems.',
        options: [
          'Photodetector',
          'Amplifier',
          'LED or laser diode',
          'Connector'
        ],
        correctAnswer: 'LED or laser diode',
        explanation: 'LEDs and laser diodes are light sources that convert electrical signals into optical signals for transmission through fibers.',
        keywords: ['LED', 'laser diode', 'electrical signals', 'optical signals'],
        rubricMapping: ['Identifies components of fiber systems']
      },
      {
        id: 'fo-s2-l6-1',
        type: 'short-answer' as const,
        level: 6,
        commandTerm: 'explain',
        question: 'Explain how wavelength division multiplexing increases fiber optic capacity.',
        options: [],
        correctAnswer: 'WDM combines multiple optical signals at different wavelengths onto a single fiber, similar to how radio stations use different frequencies. Each wavelength can carry independent data streams. Dense WDM (DWDM) can multiplex 40-80 channels with 0.8nm spacing, dramatically increasing fiber capacity without laying new cables. Optical multiplexers combine signals at the transmitter, and demultiplexers separate them at the receiver.',
        explanation: 'This demonstrates understanding of advanced fiber optic technologies and capacity enhancement methods.',
        keywords: ['wavelength division multiplexing', 'optical signals', 'different wavelengths', 'DWDM', 'capacity'],
        rubricMapping: ['Explains advanced fiber technologies', 'Demonstrates comprehensive understanding']
      }
    ],
    strand3: [
      {
        id: 'fo-s3-l4-1',
        type: 'short-answer' as const,
        level: 4,
        commandTerm: 'describe',
        question: 'Describe three major applications of fiber optic technology.',
        options: [],
        correctAnswer: '1) Telecommunications - high-speed internet and phone networks, 2) Medical applications - endoscopes for internal imaging and laser surgery delivery, 3) Industrial sensing - monitoring temperature, pressure, and structural health in harsh environments.',
        explanation: 'Fiber optics have revolutionized multiple industries through their unique properties.',
        keywords: ['telecommunications', 'medical applications', 'endoscopes', 'industrial sensing'],
        rubricMapping: ['Describes benefits of fiber optics in applications']
      },
      {
        id: 'fo-s3-l8-1',
        type: 'extended-response' as const,
        level: 8,
        commandTerm: 'evaluate',
        question: 'Evaluate the societal impact of fiber optic technology on global communications.',
        options: [],
        correctAnswer: 'Fiber optics revolutionized global communications by enabling the modern internet era. Key impacts: 1) Economic transformation - enabled e-commerce, remote work, and digital economies, 2) Social connectivity - video calls, social media, and instant global communication, 3) Educational access - online learning and digital resources, 4) Healthcare - telemedicine and remote diagnostics, 5) Entertainment - streaming services and digital media. Undersea cables connect continents with terabit capacities. However, this created digital divides between fiber-connected and unconnected regions. Environmental concerns include energy consumption of data centers and electronic waste. Future implications include smart cities, IoT networks, and augmented reality applications requiring even higher bandwidths.',
        explanation: 'This demonstrates sophisticated analysis of technology impact on society and future implications.',
        keywords: ['societal impact', 'global communications', 'digital divide', 'undersea cables', 'smart cities'],
        rubricMapping: ['Analyzes societal impact', 'Evaluates future potential']
      }
    ],
    strand4: [
      {
        id: 'fo-s4-l6-1',
        type: 'short-answer' as const,
        level: 6,
        commandTerm: 'explain',
        question: 'Explain the key design considerations for a fiber optic installation in a building.',
        options: [],
        correctAnswer: 'Key considerations: 1) Bend radius - fibers must not be bent too tightly to avoid signal loss, 2) Environmental protection - temperature, humidity, and mechanical stress protection, 3) Connector types - match equipment requirements (SC, LC, ST), 4) Cable routing - avoid electrical interference and sharp edges, 5) Future expansion - install extra capacity for growth, 6) Testing procedures - verify installation meets specifications, 7) Documentation - maintain records for maintenance.',
        explanation: 'This shows understanding of practical engineering considerations in fiber optic system design.',
        keywords: ['bend radius', 'environmental protection', 'connector types', 'cable routing', 'testing'],
        rubricMapping: ['Explains design considerations', 'Applies engineering principles']
      }
    ]
  }
};

export default strandExemplars;