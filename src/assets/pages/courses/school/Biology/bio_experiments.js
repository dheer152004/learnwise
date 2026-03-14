// bio_experiments.js — all biology experiment definitions, controls, and post-run explanations

const EXPERIMENTS = {

  // ── CELL BIOLOGY ──────────────────────────────────────────────────────────
  osmosis: {
    title: 'Osmosis & Diffusion',
    formula: 'J = P(C₁ − C₂)',
    info: 'Water moves across a semipermeable membrane from low to high solute concentration until equilibrium.',
    tag: 'CELL',
    icon: '🔵',
    duration: 3,
    controls: [
      { id: 'osConc', label: 'Solute Conc. (mol/L)', min: 0, max: 2, step: 0.05, val: 0.5, unit: 'M' },
      { id: 'osTemp', label: 'Temperature (°C)', min: 5, max: 45, step: 1, val: 25, unit: '°C' },
      { id: 'osMembrane', label: 'Membrane Perm.', min: 0.1, max: 1.0, step: 0.05, val: 0.5, unit: '' },
    ],
    explanation: {
      title: 'Osmosis & Diffusion — What Happened?',
      cards: [
        {
          label: 'Osmotic Pressure',
          text: 'Water molecules move <b>down their concentration gradient</b> — from dilute to concentrated solution. The semipermeable membrane allows water but blocks large solute molecules. This net movement is osmosis.',
          formula: 'π = MRT\nπ = osmotic pressure'
        },
        {
          label: 'Tonicity',
          text: '<b>Hypotonic</b> solution → cell swells (water enters). <b>Hypertonic</b> solution → cell shrinks (plasmolysis). <b>Isotonic</b> → no net movement. Red blood cells burst in pure water — a condition called haemolysis.',
          formula: 'J = P × ΔC\nΔC = concentration diff.'
        },
        {
          label: 'Real-World Use',
          text: '<b>Kidney</b> uses osmosis to regulate water in blood. <b>Food preservation</b> (salt/sugar) dehydrates bacteria through osmosis. <b>IV fluids</b> must be isotonic to blood (~0.9% NaCl) to prevent cell damage.',
          formula: 'van\'t Hoff: π = iCRT'
        }
      ]
    }
  },

  photosynthesis: {
    title: 'Photosynthesis',
    formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
    info: 'Chloroplasts convert light energy + CO₂ + water into glucose and oxygen via light-dependent and Calvin cycle reactions.',
    tag: 'CELL',
    icon: '🌿',
    duration: 5,
    controls: [
      { id: 'psLight', label: 'Light Intensity (%)', min: 0, max: 100, step: 5, val: 60, unit: '%' },
      { id: 'psCO2', label: 'CO₂ Level (ppm)', min: 100, max: 1000, step: 50, val: 400, unit: 'ppm' },
      { id: 'psTemp', label: 'Temperature (°C)', min: 5, max: 45, step: 1, val: 25, unit: '°C' },
    ],
    explanation: {
      title: 'Photosynthesis — What Happened?',
      cards: [
        {
          label: 'Two Stages',
          text: '<b>Light reactions</b> (thylakoid): chlorophyll absorbs photons, splits water, produces ATP + NADPH + O₂. <b>Calvin cycle</b> (stroma): ATP + NADPH used to fix CO₂ into G3P, then glucose. Light feeds the dark reactions.',
          formula: 'Light rxn: H₂O → O₂ + ATP\nCalvin: CO₂ + ATP → glucose'
        },
        {
          label: 'Limiting Factors',
          text: 'Rate is capped by whichever factor is shortest — <b>Blackman\'s Law</b>. Too little light → light reactions stall. Low CO₂ → Calvin cycle slows. Above ~35°C, enzymes denature. High light + high CO₂ → maximum rate.',
          formula: 'Rate ∝ min(light, CO₂, temp)'
        },
        {
          label: 'Importance',
          text: '<b>Basis of all food chains</b> — autotrophs capture solar energy. ~70% of Earth\'s oxygen comes from oceanic phytoplankton. Photosynthesis absorbs ~120 Gt of carbon per year, making it central to the <b>global carbon cycle</b>.',
          formula: 'ΔG = −2870 kJ/mol glucose'
        }
      ]
    }
  },

  mitosis: {
    title: 'Mitosis — Cell Division',
    formula: '1 cell → 2 identical cells',
    info: 'A somatic cell replicates its DNA then divides through Prophase → Metaphase → Anaphase → Telophase → Cytokinesis.',
    tag: 'CELL',
    icon: '🧬',
    duration: 6,
    controls: [
      { id: 'mtSpeed', label: 'Division Speed', min: 0.5, max: 3, step: 0.1, val: 1.0, unit: 'x' },
      { id: 'mtChrom', label: 'Chromosome Pairs', min: 1, max: 4, step: 1, val: 2, unit: '' },
    ],
    explanation: {
      title: 'Mitosis — What Happened?',
      cards: [
        {
          label: 'Five Stages',
          text: '<b>Prophase</b>: chromosomes condense, spindle forms. <b>Metaphase</b>: chromosomes align at equator. <b>Anaphase</b>: sister chromatids pulled to poles. <b>Telophase</b>: nuclear envelopes reform. <b>Cytokinesis</b>: cytoplasm divides.',
          formula: 'PMAT + C\n(P-M-A-T-Cytokinesis)'
        },
        {
          label: 'Why Identical?',
          text: 'DNA was replicated during <b>S phase</b> (Synthesis) in interphase. Each sister chromatid is an exact copy. Spindle fibres ensure one copy goes to each daughter cell. Result: <b>2 diploid cells genetically identical</b> to parent.',
          formula: '2n → 2n + 2n\n(diploid preserved)'
        },
        {
          label: 'Applications',
          text: '<b>Growth and repair</b>: skin cells divide ~1 million times per second. <b>Cancer</b> is uncontrolled mitosis caused by mutations in cell-cycle checkpoints. <b>Stem cells</b> use mitosis to replenish tissues throughout life.',
          formula: 'Cyclin-CDK drives G1→S→G2→M'
        }
      ]
    }
  },

  // ── GENETICS ──────────────────────────────────────────────────────────────
  mendelian: {
    title: 'Mendelian Genetics',
    formula: 'F₂ ratio: 9:3:3:1',
    info: 'Cross two heterozygous parents across two traits. Punnett squares predict offspring genotype and phenotype ratios.',
    tag: 'GENETICS',
    icon: '🧩',
    duration: 0,
    controls: [
      { id: 'mnParent1', label: 'Parent 1 alleles', min: 0, max: 2, step: 1, val: 1, unit: '' },
      { id: 'mnParent2', label: 'Parent 2 alleles', min: 0, max: 2, step: 1, val: 1, unit: '' },
      { id: 'mnDominance', label: 'Dominance strength', min: 0.5, max: 1.0, step: 0.1, val: 1.0, unit: '' },
    ],
    explanation: {
      title: 'Mendelian Genetics — What Happened?',
      cards: [
        {
          label: 'Law of Segregation',
          text: 'Each parent carries <b>two alleles</b> for each trait, but passes only one to each offspring. Alleles segregate randomly during meiosis (gamete formation). A dominant allele (A) masks a recessive (a) in Aa individuals.',
          formula: 'Aa × Aa → 1AA:2Aa:1aa\nPhenotype 3:1'
        },
        {
          label: 'Law of Independent Assortment',
          text: 'Alleles at different gene loci sort <b>independently</b> during meiosis (for genes on different chromosomes). This gives the famous <b>9:3:3:1 dihybrid ratio</b> in F₂ from AaBb × AaBb crosses.',
          formula: 'AaBb × AaBb\n→ 9A_B_:3A_bb:3aaB_:1aabb'
        },
        {
          label: 'Beyond Mendel',
          text: '<b>Incomplete dominance</b> (red + white → pink). <b>Codominance</b> (AB blood type). <b>Polygenic inheritance</b> (skin colour, height). <b>Epistasis</b>: one gene masks another. Mendel was lucky to pick traits that followed simple patterns!',
          formula: 'χ² test verifies ratios\nχ² = Σ(O−E)²/E'
        }
      ]
    }
  },

  // ── PHYSIOLOGY ────────────────────────────────────────────────────────────
  enzyme: {
    title: 'Enzyme Kinetics',
    formula: 'v = Vmax[S] / (Km + [S])',
    info: 'Enzymes speed reactions without being consumed. Rate follows Michaelis-Menten kinetics: increases with substrate until saturation.',
    tag: 'PHYSIO',
    icon: '⚗️',
    duration: 6,
    controls: [
      { id: 'enSubstrate', label: '[Substrate] (mM)', min: 0, max: 20, step: 0.5, val: 5, unit: 'mM' },
      { id: 'enTemp', label: 'Temperature (°C)', min: 0, max: 70, step: 1, val: 37, unit: '°C' },
      { id: 'enPH', label: 'pH', min: 2, max: 12, step: 0.2, val: 7.0, unit: '' },
      { id: 'enInhib', label: 'Inhibitor conc.', min: 0, max: 5, step: 0.1, val: 0, unit: 'mM' },
    ],
    explanation: {
      title: 'Enzyme Kinetics — What Happened?',
      cards: [
        {
          label: 'Michaelis-Menten',
          text: 'At low [S], rate ∝ [S] (first order). As [S] rises, enzyme active sites saturate — rate plateaus at <b>Vmax</b>. Km is the [S] giving half-Vmax. <b>Low Km = high affinity</b>. Km and Vmax are measured via Lineweaver-Burk plots.',
          formula: 'v = Vmax[S] / (Km + [S])\nLineweaver-Burk: 1/v vs 1/[S]'
        },
        {
          label: 'Temperature & pH',
          text: 'Rate doubles per 10°C rise (Q10 ≈ 2) up to the <b>optimum temperature</b>. Above optimum, denaturation destroys the active site shape. pH alters ionisation of active-site residues — each enzyme has a <b>narrow pH optimum</b> (e.g. pepsin at pH 2, trypsin at pH 8).',
          formula: 'Q₁₀ = (R₂/R₁)^(10/(T₂−T₁))'
        },
        {
          label: 'Inhibition',
          text: '<b>Competitive</b>: inhibitor mimics substrate, blocks active site (raises Km, same Vmax). <b>Non-competitive</b>: binds elsewhere, changes shape (lowers Vmax). Many drugs work as enzyme inhibitors — aspirin, statins, penicillin.',
          formula: 'Comp: Km(app) = Km(1+I/Ki)\nNon-comp: Vmax(app) = Vmax/(1+I/Ki)'
        }
      ]
    }
  },

  heartrate: {
    title: 'Cardiac Cycle',
    formula: 'CO = HR × SV',
    info: 'The heart contracts and relaxes in a rhythmic cycle. Cardiac output = Heart Rate × Stroke Volume.',
    tag: 'PHYSIO',
    icon: '❤️',
    duration: 6,
    controls: [
      { id: 'hrRate', label: 'Heart Rate (bpm)', min: 40, max: 180, step: 5, val: 72, unit: 'bpm' },
      { id: 'hrStroke', label: 'Stroke Vol. (mL)', min: 40, max: 120, step: 5, val: 70, unit: 'mL' },
      { id: 'hrExercise', label: 'Exercise Level', min: 0, max: 3, step: 1, val: 0, unit: '' },
    ],
    explanation: {
      title: 'Cardiac Cycle — What Happened?',
      cards: [
        {
          label: 'Systole & Diastole',
          text: '<b>Diastole</b>: heart relaxes, fills with blood (atria contract first). <b>Systole</b>: ventricles contract, pumping blood to lungs (right) and body (left). The "lub-dub" sound comes from AV valves closing then semilunar valves closing.',
          formula: 'Cycle time = 60/HR\nNormal: 0.83 s at 72 bpm'
        },
        {
          label: 'Cardiac Output',
          text: 'At rest: CO ≈ 72 × 70 = <b>5.04 L/min</b> — the entire blood volume circulated once per minute. During exercise, both HR and SV increase. Elite athletes have larger hearts: high SV at low HR gives same CO with less effort.',
          formula: 'CO = HR × SV\nMax CO ~25 L/min (elite)'
        },
        {
          label: 'Regulation',
          text: '<b>Sinoatrial (SA) node</b> — the heart\'s natural pacemaker — fires at 60-100 bpm. Sympathetic nervous system accelerates it (exercise, adrenaline). Parasympathetic (vagus nerve) slows it (rest). <b>ECG</b> records the electrical waves: P, QRS, T.',
          formula: 'SA node → AV node → Bundle of His → Purkinje fibres'
        }
      ]
    }
  },

  // ── CIRCULATORY SYSTEM ────────────────────────────────────────────────────
  bloodflow: {
    title: 'Blood Circulation',
    formula: 'Q = ΔP / R',
    info: 'Blood flows through a double-loop circulatory system. The right side pumps deoxygenated blood to the lungs; the left side pumps oxygenated blood to the body.',
    tag: 'PHYSIO',
    icon: '🩸',
    duration: 6,
    controls: [
      { id: 'bfHR', label: 'Heart Rate (bpm)', min: 40, max: 180, step: 5, val: 72, unit: 'bpm' },
      { id: 'bfBP', label: 'Blood Pressure', min: 60, max: 160, step: 5, val: 120, unit: 'mmHg' },
      { id: 'bfViscosity', label: 'Blood Viscosity', min: 0.5, max: 2.0, step: 0.1, val: 1.0, unit: 'x' },
      { id: 'bfExercise', label: 'Exercise Level', min: 0, max: 3, step: 1, val: 0, unit: '' },
    ],
    explanation: {
      title: 'Blood Circulation — What Happened?',
      cards: [
        {
          label: 'Double Circulation',
          text: '<b>Pulmonary circuit</b>: right ventricle → lungs → left atrium. Blood picks up O₂ and drops CO₂. <b>Systemic circuit</b>: left ventricle → body → right atrium. Blood delivers O₂ to tissues. The two circuits run simultaneously — one heartbeat drives both.',
          formula: 'Q = ΔP / R\n(Flow = Pressure / Resistance)'
        },
        {
          label: 'Vessel Types',
          text: '<b>Arteries</b> (red): thick walls, carry blood away from heart under high pressure. <b>Veins</b> (blue): thin walls, valves prevent backflow, low pressure. <b>Capillaries</b>: one cell thick — where gas, nutrient and waste exchange actually happens.',
          formula: 'v = Q / A\nPoiseuille: Q = πr⁴ΔP/8ηL'
        },
        {
          label: 'Blood Composition',
          text: '<b>Red blood cells</b> carry O₂ via haemoglobin (one RBC holds ~270 million Hb molecules). <b>White blood cells</b> fight infection. <b>Platelets</b> clot wounds. <b>Plasma</b> transports nutrients, hormones, CO₂. 5 litres in an adult, fully recirculated every ~60 seconds.',
          formula: 'Hb + O₂ ⇌ HbO₂\n(cooperative binding)'
        }
      ]
    }
  },

  // ── REPRODUCTION ──────────────────────────────────────────────────────────
  pollination: {
    title: 'Flower Pollination',
    formula: 'Pollen tube: ~1 cm/hr',
    info: 'A bee collects nectar and transfers pollen grains between flowers. Pollen landing on a stigma germinates a tube that delivers sperm to the ovule for fertilisation.',
    tag: 'REPRO',
    icon: '🌸',
    duration: 6,
    controls: [
      { id: 'plBeeSpeed', label: 'Bee Speed', min: 0.5, max: 3.0, step: 0.1, val: 1.0, unit: 'x' },
      { id: 'plWindSpeed', label: 'Wind Speed', min: 0, max: 5, step: 0.5, val: 1.0, unit: 'm/s' },
      { id: 'plPollenAmt', label: 'Pollen Amount', min: 1, max: 5, step: 1, val: 3, unit: '' },
      { id: 'plFlowerDist', label: 'Flower Distance (m)', min: 1, max: 5, step: 0.5, val: 2.5, unit: 'm' },
    ],
    explanation: {
      title: 'Flower Pollination — What Happened?',
      cards: [
        {
          label: 'Pollination Vectors',
          text: '<b>Biotic</b>: bees, butterflies, birds and bats attracted by nectar, colour, scent. They carry pollen on their bodies between flowers (cross-pollination). <b>Abiotic</b>: wind-pollinated flowers (grasses, conifers) produce huge quantities of lightweight pollen — no need for petals or nectar.',
          formula: 'Cross-pollination → genetic diversity\nSelf-pollination → no bee needed'
        },
        {
          label: 'Pollen Tube & Fertilisation',
          text: 'Once a pollen grain lands on a compatible <b>stigma</b>, it germinates. The <b>pollen tube</b> grows down through the style into the ovary. Two sperm travel down: one fertilises the egg (→ embryo), the other fuses with polar nuclei (→ endosperm). This <b>double fertilisation</b> is unique to flowering plants.',
          formula: 'Egg + sperm → zygote (2n)\nPolar nuclei + sperm → endosperm (3n)'
        },
        {
          label: 'Flower Anatomy',
          text: '<b>Anther</b>: makes pollen (male). <b>Filament + anther = stamen</b> (male). <b>Stigma</b>: sticky landing pad (female). <b>Style</b>: connects stigma to ovary. <b>Ovary</b>: contains ovules → becomes fruit after fertilisation. <b>Petals</b> attract pollinators.',
          formula: 'Stamen (♂): anther + filament\nPistil (♀): stigma + style + ovary'
        }
      ]
    }
  },

  // ── ECOLOGY ───────────────────────────────────────────────────────────────
  population: {
    title: 'Population Growth',
    formula: 'dN/dt = rN(1 − N/K)',
    info: 'Populations grow exponentially when resources are unlimited, but logistic growth produces an S-curve as they approach carrying capacity K.',
    tag: 'ECOLOGY',
    icon: '📈',
    duration: 6,
    controls: [
      { id: 'popN0', label: 'Initial Pop. (N₀)', min: 10, max: 500, step: 10, val: 50, unit: '' },
      { id: 'popR', label: 'Growth Rate (r)', min: 0.05, max: 1.5, step: 0.05, val: 0.3, unit: '/yr' },
      { id: 'popK', label: 'Carrying Cap. (K)', min: 200, max: 2000, step: 100, val: 800, unit: '' },
    ],
    explanation: {
      title: 'Population Growth — What Happened?',
      cards: [
        {
          label: 'Exponential vs Logistic',
          text: '<b>Exponential</b> (J-curve): unlimited resources, N grows without bound — dN/dt = rN. <b>Logistic</b> (S-curve): as N → K, growth slows. At N = K/2, growth rate is maximum. Once N reaches K, net growth = 0.',
          formula: 'Logistic: dN/dt = rN(1−N/K)\nExponential: dN/dt = rN'
        },
        {
          label: 'Carrying Capacity',
          text: 'K is set by <b>limiting factors</b>: food, water, space, disease, predation. Exceed K → population crashes (overshoot). <b>Boom-bust cycles</b> are common in insects, lynx-hare systems. Humans have raised K through agriculture and technology.',
          formula: 'N(t) = K / (1 + ((K−N₀)/N₀)e^(−rt))'
        },
        {
          label: 'Real-World Models',
          text: '<b>Rabbits in Australia</b>: introduced without predators, showed explosive exponential growth. <b>Fishing quotas</b> aim to keep fish stocks near K/2 (max sustainable yield). <b>Epidemics</b> follow similar logistic curves — used in COVID-19 modelling.',
          formula: 'MSY = rK/4 (max sustainable yield)'
        }
      ]
    }
  },

  // ── EVOLUTION ─────────────────────────────────────────────────────────────
  naturalselection: {
    title: 'Natural Selection',
    formula: 'Δp = spq² / (1−sq²)',
    info: 'Allele frequencies shift across generations when traits differ in fitness. Watch how selection pressure changes the gene pool over time.',
    tag: 'EVOL',
    icon: '🦋',
    duration: 6,
    controls: [
      { id: 'nsFreq', label: 'Initial allele freq.', min: 0.05, max: 0.95, step: 0.05, val: 0.5, unit: '' },
      { id: 'nsSelect', label: 'Selection coeff. (s)', min: 0, max: 1.0, step: 0.05, val: 0.3, unit: '' },
      { id: 'nsPopSize', label: 'Population size', min: 20, max: 500, step: 20, val: 200, unit: '' },
    ],
    explanation: {
      title: 'Natural Selection — What Happened?',
      cards: [
        {
          label: 'Hardy-Weinberg Baseline',
          text: 'Without selection, mutation, drift, or migration, allele frequencies stay constant (Hardy-Weinberg equilibrium): p² + 2pq + q² = 1. Any deviation tells us <b>evolution is occurring</b>. The simulation adds selection pressure to shift the allele pool.',
          formula: 'p² + 2pq + q² = 1\np + q = 1'
        },
        {
          label: 'Selection Pressure',
          text: 'Higher selection coefficient (s) → faster allele frequency change. <b>Directional selection</b> pushes one allele toward fixation. In small populations, random <b>genetic drift</b> can overpower selection — the losing allele may still fix by chance.',
          formula: 'Δp = sp(1−p)[p+h(1−2p)] / w̄'
        },
        {
          label: 'Classic Examples',
          text: '<b>Peppered moths</b>: industrial soot selected dark morphs within decades. <b>Antibiotic resistance</b>: bacteria evolve resistance in just days. <b>Sickle-cell heterozygotes</b>: balanced polymorphism — Aa fitter than both AA and aa in malaria zones.',
          formula: 'Balanced: s(AA) = s(aa)\nHeterozygote advantage'
        }
      ]
    }
  },

};