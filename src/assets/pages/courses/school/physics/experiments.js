// experiments.js — all experiment definitions, controls, and post-run explanations

const EXPERIMENTS = {

  // ── MECHANICS ──────────────────────────────────────────────────────────
  pendulum: {
    title: 'Simple Pendulum',
    formula: 'T = 2\u03c0\u221a(L/g)',
    info: 'Period depends only on length, not mass. Discovered by Galileo through careful observation.',
    tag: 'MECH',
    icon: '\u23f1',
    duration: 7,
    controls: [
      { id: 'pLen', label: 'Length (m)', min: 0.2, max: 2.5, step: 0.1, val: 1.0, unit: 'm' },
      { id: 'pMass', label: 'Mass (kg)', min: 0.1, max: 3, step: 0.1, val: 0.5, unit: 'kg' },
      { id: 'pAngle', label: 'Angle (\u00b0)', min: 5, max: 70, step: 1, val: 30, unit: '\u00b0' },
      { id: 'pDamp', label: 'Damping', min: 0, max: 0.06, step: 0.005, val: 0.01, unit: '' },
    ],
    explanation: {
      title: 'Simple Pendulum \u2014 What Happened?',
      cards: [
        {
          label: 'Key Principle',
          text: 'Gravity acts as a <b>restoring force</b>, always pulling the bob back to equilibrium. For small angles, the motion is almost perfectly sinusoidal \u2014 called Simple Harmonic Motion.',
          formula: 'T = 2\u03c0\u221a(L/g)'
        },
        {
          label: 'Energy Conservation',
          text: 'At the highest point, energy is <b>entirely potential</b>. At the bottom it is <b>entirely kinetic</b>. Damping converts mechanical energy to heat, shrinking amplitude over time.',
          formula: 'KE + PE = constant\nmgh = \u00bdmv\u00b2'
        },
        {
          label: 'Real-World Use',
          text: '<b>Grandfather clocks</b> use pendulums to keep time. <b>Foucault\'s pendulum</b> proved Earth\'s rotation in 1851. Seismographs use suspended masses on the same principle.',
          formula: 'g = 4\u03c0\u00b2L / T\u00b2'
        }
      ]
    }
  },

  projectile: {
    title: 'Projectile Motion',
    formula: 'R = v\u2080\u00b2 sin(2\u03b8) / g',
    info: 'Horizontal velocity is constant; vertical velocity changes due to gravity. Maximum range at 45\u00b0.',
    tag: 'MECH',
    icon: '\ud83c\udfaf',
    duration: 7,
    controls: [
      { id: 'pjVel', label: 'Speed (m/s)', min: 5, max: 60, step: 1, val: 25, unit: 'm/s' },
      { id: 'pjAngle', label: 'Angle (\u00b0)', min: 5, max: 85, step: 1, val: 45, unit: '\u00b0' },
      { id: 'pjGrav', label: 'Gravity (m/s\u00b2)', min: 1.6, max: 9.8, step: 0.1, val: 9.8, unit: 'm/s\u00b2' },
    ],
    explanation: {
      title: 'Projectile Motion \u2014 What Happened?',
      cards: [
        {
          label: 'Two Independent Axes',
          text: '<b>Horizontal</b>: constant velocity, no force acts. <b>Vertical</b>: uniform acceleration downward. A ball thrown sideways hits the ground at the same time as one dropped from the same height.',
          formula: 'x = v\u2080cos\u03b8 \u00b7 t\ny = v\u2080sin\u03b8 \u00b7 t \u2212 \u00bdgt\u00b2'
        },
        {
          label: 'Optimal Angle',
          text: '<b>45\u00b0 gives maximum range</b> because sin(2\u00d745\u00b0) = 1. Complementary angles (30\u00b0 & 60\u00b0) give identical range but differ in height and flight time.',
          formula: 'R = v\u2080\u00b2 sin(2\u03b8) / g\nH = v\u2080\u00b2 sin\u00b2\u03b8 / 2g'
        },
        {
          label: 'Effect of Gravity',
          text: 'Moon gravity (1.6 m/s\u00b2) gives <b>6\u00d7 more range</b> than Earth. Golfer Alan Shepard hit a ball on the Moon that travelled hundreds of metres. Air resistance (ignored here) reduces range significantly.',
          formula: 't\u209c\u1d48\u209c\u209c\u2091\u1d48 = 2v\u2080 sin\u03b8 / g'
        }
      ]
    }
  },

  spring: {
    title: 'Spring \u2014 SHM',
    formula: 'T = 2\u03c0\u221a(m/k)',
    info: 'Restoring force F = \u2212kx. Period is independent of amplitude \u2014 the hallmark of SHM.',
    tag: 'MECH',
    icon: '\ud83d\udd01',
    duration: 7,
    controls: [
      { id: 'spK', label: 'Spring Const (N/m)', min: 1, max: 25, step: 0.5, val: 5, unit: 'N/m' },
      { id: 'spM', label: 'Mass (kg)', min: 0.1, max: 3, step: 0.1, val: 0.5, unit: 'kg' },
      { id: 'spA', label: 'Amplitude (m)', min: 0.02, max: 0.25, step: 0.01, val: 0.1, unit: 'm' },
    ],
    explanation: {
      title: 'Spring SHM \u2014 What Happened?',
      cards: [
        {
          label: "Hooke's Law",
          text: 'The spring exerts <b>F = \u2212kx</b>: force is proportional to displacement and always opposes it. This restoring force drives the oscillation back and forth through equilibrium.',
          formula: 'F = \u2212kx'
        },
        {
          label: 'Energy Exchange',
          text: 'Kinetic energy peaks at <b>equilibrium (x = 0)</b> and drops to zero at the extremes. Potential energy does the opposite. Total mechanical energy remains constant: E = \u00bdkA\u00b2.',
          formula: 'E = \u00bdmv\u00b2 + \u00bdkx\u00b2 = \u00bdkA\u00b2'
        },
        {
          label: 'Period & Frequency',
          text: '<b>Heavier mass \u2192 slower</b> (T \u221d \u221am). <b>Stiffer spring \u2192 faster</b> (T \u221d 1/\u221ak). Amplitude does NOT affect period. Quartz clocks exploit this principle to keep precise time.',
          formula: '\u03c9 = \u221a(k/m)\nT = 2\u03c0/\u03c9'
        }
      ]
    }
  },

  // ── WAVES & OPTICS ─────────────────────────────────────────────────────
  vibgyor: {
    title: 'VIBGYOR \u2014 Dispersion',
    formula: 'n = c / v(\u03bb)',
    info: 'White light splits into VIBGYOR because each wavelength bends by a different amount through glass.',
    tag: 'OPTICS',
    icon: '\ud83c\udf08',
    duration: 3,
    controls: [
      { id: 'prismAngle', label: 'Prism Angle (\u00b0)', min: 30, max: 75, step: 1, val: 60, unit: '\u00b0' },
      { id: 'incAngle', label: 'Incident Angle (\u00b0)', min: 20, max: 70, step: 1, val: 45, unit: '\u00b0' },
    ],
    explanation: {
      title: 'VIBGYOR Dispersion \u2014 What Happened?',
      cards: [
        {
          label: 'Why Light Splits',
          text: 'Glass has a <b>different refractive index for each colour</b>. Violet bends most (n\u22481.53), red bends least (n\u22481.51). This wavelength-dependent bending is called <b>dispersion</b>.',
          formula: 'n\u1d65\u1d62\u1d52\u1d57 > n\u1d63\u1d49\u1d48 \u27f9 \u03b8\u1d65\u1d62\u1d52\u1d57 > \u03b8\u1d63\u1d49\u1d48'
        },
        {
          label: 'VIBGYOR Order',
          text: 'Violet, Indigo, Blue, Green, Yellow, Orange, Red. <b>Violet has shortest wavelength</b> (~380nm) so it refracts most. Red is longest (~700nm) and refracts least. Rainbows form by the same process in water droplets.',
          formula: '\u03bb: 380nm\u2192700nm\nn: 1.53\u21921.51'
        },
        {
          label: 'Real Applications',
          text: '<b>Rainbows</b> are sunlight dispersed by raindrops. <b>Spectroscopy</b> uses prisms to identify elements by their light fingerprint. <b>Optical fibres</b> must control dispersion to prevent signal smearing.',
          formula: 'c = f \u00b7 \u03bb\nv = c/n(\u03bb)'
        }
      ]
    }
  },

  snell: {
    title: "Snell's Law",
    formula: 'n\u2081 sin\u03b8\u2081 = n\u2082 sin\u03b8\u2082',
    info: 'Light bends toward the normal entering a denser medium. Critical angle triggers total internal reflection.',
    tag: 'OPTICS',
    icon: '\ud83d\udca1',
    duration: 3,
    controls: [
      { id: 'opN1', label: 'n\u2081 (top)', min: 1, max: 2.5, step: 0.05, val: 1.0, unit: '' },
      { id: 'opN2', label: 'n\u2082 (bottom)', min: 1, max: 2.5, step: 0.05, val: 1.5, unit: '' },
      { id: 'opAngle', label: 'Incident Angle (\u00b0)', min: 1, max: 85, step: 1, val: 45, unit: '\u00b0' },
    ],
    explanation: {
      title: "Snell's Law \u2014 What Happened?",
      cards: [
        {
          label: 'Why Light Bends',
          text: 'Light slows down in denser media. When it hits the boundary at an angle, one side of the wavefront slows before the other, bending the beam. Like a car wheel hitting mud \u2014 the slow side turns toward it.',
          formula: 'n\u2081 sin\u03b8\u2081 = n\u2082 sin\u03b8\u2082'
        },
        {
          label: 'Total Internal Reflection',
          text: 'When going from <b>dense \u2192 less dense</b>, past the critical angle \u03b8\u1d9c, ALL light reflects back. No refracted ray escapes. <b>Fibre optic cables</b> and diamond brilliance both rely on TIR.',
          formula: '\u03b8\u1d9c = arcsin(n\u2082/n\u2081)'
        },
        {
          label: 'Refractive Index',
          text: 'n = c/v \u2014 how much slower light travels in a medium. Water: n\u22481.33, glass: n\u22481.5, diamond: n\u22482.42. <b>Higher n = more bending</b>. Camera lenses combine multiple glass types to focus sharply.',
          formula: 'n = c/v'
        }
      ]
    }
  },

  wave: {
    title: 'Wave Interference',
    formula: '\u0394 = n\u03bb (constructive)',
    info: 'Two coherent sources create bright (constructive) and dark (destructive) interference patterns.',
    tag: 'WAVES',
    icon: '\u3030',
    duration: 7,
    controls: [
      { id: 'wFreq', label: 'Frequency (Hz)', min: 0.5, max: 5, step: 0.1, val: 1.5, unit: 'Hz' },
      { id: 'wSep', label: 'Source Sep. (m)', min: 0.5, max: 3, step: 0.1, val: 1.5, unit: 'm' },
      { id: 'wPhase', label: 'Phase Diff (\u00b0)', min: 0, max: 180, step: 5, val: 0, unit: '\u00b0' },
    ],
    explanation: {
      title: 'Wave Interference \u2014 What Happened?',
      cards: [
        {
          label: 'Superposition',
          text: 'When two waves meet, they <b>add algebraically</b> at every point. Crests meeting crests double the amplitude (constructive). A crest meeting a trough cancels to zero (destructive).',
          formula: 'y = y\u2081 + y\u2082'
        },
        {
          label: 'Path Difference',
          text: '<b>Constructive</b> (cyan): path difference = whole number of wavelengths. <b>Destructive</b> (red): path difference = half-wavelength. The pattern shifts when you change source separation or phase.',
          formula: 'Constructive: \u0394 = n\u03bb\nDestructive: \u0394 = (n+\u00bd)\u03bb'
        },
        {
          label: 'Applications',
          text: '<b>Noise-cancelling headphones</b> use destructive interference. <b>Soap bubble colours</b> come from thin-film interference. The famous double-slit experiment proved light is a wave.',
          formula: '\u03bb = v/f'
        }
      ]
    }
  },

  // ── THERMODYNAMICS ─────────────────────────────────────────────────────
  boyle: {
    title: "Boyle's Law",
    formula: 'P\u2081V\u2081 = P\u2082V\u2082',
    info: 'At constant temperature, pressure and volume of a gas are inversely proportional.',
    tag: 'THERMO',
    icon: '\ud83d\udd2c',
    duration: 3,
    controls: [
      { id: 'blV', label: 'Volume (L)', min: 1, max: 20, step: 0.5, val: 10, unit: 'L' },
      { id: 'blTemp', label: 'Temperature (K)', min: 200, max: 500, step: 10, val: 300, unit: 'K' },
      { id: 'blMol', label: 'Moles of gas (n)', min: 0.1, max: 2, step: 0.1, val: 0.5, unit: 'mol' },
    ],
    explanation: {
      title: "Boyle's Law \u2014 What Happened?",
      cards: [
        {
          label: "Boyle's Law",
          text: 'At constant temperature, <b>P \u00d7 V = constant</b>. Compress gas into half the volume \u2192 pressure doubles. This happens because molecules hit the walls twice as often in a smaller space.',
          formula: 'P\u2081V\u2081 = P\u2082V\u2082\nPV = nRT'
        },
        {
          label: 'Molecular View',
          text: 'Pressure arises from <b>molecules colliding with walls</b>. Smaller volume means shorter distances between walls, so molecules collide more frequently. Temperature determines speed, kept constant here.',
          formula: 'P = nRT/V'
        },
        {
          label: 'Applications',
          text: '<b>Syringe</b>: pull the plunger to reduce pressure and draw in liquid. <b>Deep sea diving</b>: pressure increases with depth, compressing air in tanks. <b>Breathing</b>: lungs expand to lower pressure, drawing air in.',
          formula: 'R = 8.314 J/mol\u00b7K'
        }
      ]
    }
  },

  // ── ELECTRICITY ────────────────────────────────────────────────────────
  capacitor: {
    title: 'Capacitor Charging',
    formula: 'V(t) = V\u2080(1 \u2212 e\u207b\u1d57\u1d9c\u207c)',
    info: 'A capacitor charges exponentially through a resistor. The time constant \u03c4 = RC determines the rate.',
    tag: 'ELEC',
    icon: '\u26a1',
    duration: 7,
    controls: [
      { id: 'capC', label: 'Capacitance (\u00b5F)', min: 10, max: 500, step: 10, val: 100, unit: '\u00b5F' },
      { id: 'capR', label: 'Resistance (k\u03a9)', min: 1, max: 50, step: 1, val: 10, unit: 'k\u03a9' },
      { id: 'capV', label: 'Source Voltage (V)', min: 5, max: 24, step: 1, val: 12, unit: 'V' },
    ],
    explanation: {
      title: 'Capacitor Charging \u2014 What Happened?',
      cards: [
        {
          label: 'RC Time Constant',
          text: '<b>\u03c4 = RC</b> is the time to charge to 63.2% of the final voltage. After 5\u03c4, the capacitor is 99.3% charged. Larger R or C slows the process \u2014 the resistor limits current flow.',
          formula: '\u03c4 = RC\nV(t) = V\u2080(1\u2212e\u207b\u1d57/\u1d9c)'
        },
        {
          label: 'Exponential Decay',
          text: 'As voltage builds up, the <b>voltage difference shrinks</b>, so current (and charging rate) slows exponentially. The current starts maximum and decays: I(t) = (V\u2080/R) \u00d7 e\u207b\u1d57/\u1d9c.',
          formula: 'I(t) = (V\u2080/R) e\u207b\u1d57/\u1d9c\nQ(t) = CV\u2080(1\u2212e\u207b\u1d57/\u1d9c)'
        },
        {
          label: 'Applications',
          text: '<b>Camera flashes</b> store energy in capacitors and release it instantly. <b>Heart defibrillators</b> charge a capacitor then discharge it through the patient. <b>Filters</b> in audio circuits use RC time constants.',
          formula: 'E = \u00bdCV\u00b2'
        }
      ]
    }
  },

  // ── MODERN PHYSICS ─────────────────────────────────────────────────────
  photoelectric: {
    title: 'Photoelectric Effect',
    formula: 'E = hf = \u03c6 + KE\u2098\u2090\u02e3',
    info: 'Light above a threshold frequency ejects electrons from metal. Proved light is made of photons.',
    tag: 'MODERN',
    icon: '\u2697',
    duration: 3,
    controls: [
      { id: 'peFreq', label: 'Light Freq (PHz)', min: 0.5, max: 3.0, step: 0.05, val: 1.0, unit: 'PHz' },
      { id: 'peMetal', label: 'Metal (work fn eV)', min: 2.0, max: 5.5, step: 0.1, val: 4.5, unit: 'eV' },
    ],
    explanation: {
      title: 'Photoelectric Effect \u2014 What Happened?',
      cards: [
        {
          label: "Einstein's Insight",
          text: 'Light comes in <b>packets called photons</b> with energy E = hf. If a photon\'s energy exceeds the metal\'s work function \u03c6, it ejects an electron. Below the threshold frequency, NO electrons are ejected \u2014 no matter how bright.',
          formula: 'E = hf\nh = 6.626\u00d710\u207b\u00b3\u2074 J\u00b7s'
        },
        {
          label: 'Threshold Frequency',
          text: 'Each metal has a <b>work function \u03c6</b> \u2014 minimum energy to free an electron. If hf < \u03c6, the electron cannot escape. If hf > \u03c6, the excess becomes kinetic energy of the ejected electron.',
          formula: 'f\u209c = \u03c6/h\nKE = hf \u2212 \u03c6'
        },
        {
          label: 'Historical Significance',
          text: 'This experiment, explained by <b>Albert Einstein in 1905</b>, won him the Nobel Prize. It proved light is quantised into photons, launching quantum mechanics and the modern understanding of wave-particle duality.',
          formula: 'eV\u209b = hf \u2212 \u03c6'
        }
      ]
    }
  },

};
