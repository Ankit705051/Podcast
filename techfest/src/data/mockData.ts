import type { EventItem, Speaker, ScheduleItem, LeaderboardTeam, WorkshopItem, SponsorItem, TeamMember, SectorQuadrant } from '../types';

export const FEST_METADATA = {
  name: 'SYNAPSE 2026',
  edition: '4TH QUANTUM EDITION',
  tagline: 'A Tech Odyssey at the Edge of AGI & Cybernetics',
  startDate: '2026-10-24T09:00:00',
  endDate: '2026-10-26T20:00:00',
  location: 'Cybernetics Quad & Virtual Metaverse, Sector 7',
  totalPrizePool: '$75,000+',
  expectedHackers: '1,200+',
  universities: '64 Universities',
  sponsorPartners: ['NVIDIA Quantum', 'Anthropic Labs', 'Neuralink Core', 'Supabase', 'Cloudflare', 'Vercel']
};

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-edge-agi',
    title: 'TURING CITY: EDGE OF AGI',
    category: 'hackathon',
    categoryLabel: 'Flagship Hackathon',
    tagline: '48-hour continuous sprint building autonomous multi-agent intelligence.',
    description: 'Enter the neon-lit matrix of Turing City. Synthesize self-evolving autonomous LLM agents, decentralized physical infrastructure (DePIN), and real-time neuro-symbolic systems.',
    rules: [
      'Maximum 4 operatives per squadron.',
      'All code must be committed to public GitHub repositories created after initiation.',
      'Use of open-source models, custom fine-tunes, and API keys supplied by lab partners is permitted.',
      'Live 3-minute holographic pitch and demo before the grand jury on Day 03.'
    ],
    prizes: {
      first: '$15,000 + Golden Ticket to Helsinki AI Summit',
      second: '$7,500 + NVIDIA H100 GPU Cloud Credits',
      third: '$3,500 + Venture Fast-Track Pitch',
      total: '$26,000',
      perks: ['Y Combinator Interview Priority', 'Custom Cyber Trophy', 'All-Expenses Paid Travel']
    },
    teamSize: '2 - 4 Operatives',
    date: 'OCT 24 - 26, 2026',
    time: '48H Non-Stop',
    venue: 'Sector 01 — Turing Core Arena',
    difficulty: 'Singularity',
    image: '/assets/turing_city.png',
    tags: ['Autonomous Agents', 'LLM Architectures', 'Edge AGI', 'Spatial Computing'],
    featured: true,
    registrationOpen: true,
    slotsRemaining: 18
  },
  {
    id: 'evt-quantum-core',
    title: 'QUANTUM PROTOCOL HACK',
    category: 'ai-quantum',
    categoryLabel: 'Quantum & Deep Tech',
    tagline: 'Pioneer quantum algorithms and post-quantum cryptographic shields.',
    description: 'Harness simulated quantum processing units (QPUs) to benchmark quantum key distribution, Shor optimization shortcuts, and quantum annealing for biochemical synthesis.',
    rules: [
      'Teams of 1 to 3 researchers.',
      'Implement solutions in Qiskit, Cirq, or Pennylane.',
      'Novelty of quantum circuit optimization heavily weighted.'
    ],
    prizes: {
      first: '$10,000 + Quantum Research Fellowship',
      second: '$5,000 + Rigetti Computing Access',
      third: '$2,000 + Hardware Key Modules',
      total: '$17,000',
      perks: ['Published in Quantum Proceedings', 'Lab Internship Offers']
    },
    teamSize: '1 - 3 Researchers',
    date: 'OCT 25, 2026',
    time: '10:00 - 20:00 UTC',
    venue: 'Sector 04 — Qubit Cleanroom',
    difficulty: 'Singularity',
    image: '/assets/quantum_waves.jpg',
    tags: ['Qiskit', 'Post-Quantum Crypto', 'Quantum Annealing'],
    featured: true,
    registrationOpen: true,
    slotsRemaining: 12
  },
  {
    id: 'evt-cyberswarm-bots',
    title: 'CYBERSWARM ROBO-WARS',
    category: 'robotics',
    categoryLabel: 'Autonomous Robotics',
    tagline: 'High-octane autonomous combat bots and precision drone swarm races.',
    description: 'Witness steel clash with carbon-fiber in the electrified Octagon. Program your bipedal mechs or deploy 5-drone synchronized swarms to navigate obstacle labyrinths.',
    rules: [
      'Weight class: Featherweight (15kg) and Swarm Quad (under 250g each).',
      'Autonomous vision guidance gives 2.5x point multiplier over RF remote control.',
      'Pneumatic and kinetic weaponry permitted; flame and jamming prohibited.'
    ],
    prizes: {
      first: '$8,000 + CNC Machining Studio Grant',
      second: '$4,000 + Boston Dynamics SDK Kit',
      third: '$2,000 + Lidar Sensor Packs',
      total: '$14,000',
      perks: ['Battle Damage Trophies', 'Hardware Lab Sponsorship']
    },
    teamSize: '2 - 5 Engineers',
    date: 'OCT 25, 2026',
    time: '13:00 - 19:00 UTC',
    venue: 'Sector 03 — Steel Coliseum',
    difficulty: 'Specialist',
    image: '/assets/cyber_head.jpg',
    tags: ['ROS2', 'Computer Vision', 'Combat Robotics', 'Drone Swarm'],
    featured: true,
    registrationOpen: true,
    slotsRemaining: 8
  },
  {
    id: 'evt-neural-esports',
    title: 'VALORANT PROTOCOL: MATRIX APEX',
    category: 'esports',
    categoryLabel: 'Cyber Esports',
    tagline: '5v5 high-octane collegiate cyber tournament on 360Hz ultra-low latency rigs.',
    description: 'The top 16 collegiate tactical esports squads battle on custom sci-fi maps with live holographic HUD telemetry and neural biometric monitors broadcast to 50k viewers.',
    rules: [
      '5 players + 1 substitute per squad.',
      'Double elimination bracket, Best of 3 quarterfinals, Best of 5 Grand Finals.',
      'Standard anti-cheat and biometric telemetry monitoring strictly enforced.'
    ],
    prizes: {
      first: '$6,000 + Custom Cyberpunk Championship Rings',
      second: '$3,000 + OLED 360Hz Gaming Rigs',
      third: '$1,500 + HyperX Pro Gear Sets',
      total: '$10,500',
      perks: ['Streamed on Twitch / YouTube Cyber Channel', 'Pro Team Scouting']
    },
    teamSize: '5 Players',
    date: 'OCT 24 - 25, 2026',
    time: '16:00 - 23:00 UTC',
    venue: 'Sector 06 — Holographic Arena',
    difficulty: 'Specialist',
    image: '/assets/portal_tunnel.png',
    tags: ['5v5 Tactical', 'Live Cast', '360Hz Rigs', 'Grand Finals'],
    featured: false,
    registrationOpen: true,
    slotsRemaining: 4
  },
  {
    id: 'evt-speed-battleground',
    title: 'SINGULARITY SPEED CODING',
    category: 'coding',
    categoryLabel: 'Algorithmic Duel',
    tagline: '1v1 elimination blitz solving algorithmic challenges in an electrified duel.',
    description: 'Lightning-fast competitive programming duels. Real-time test-case visualizers, obfuscated byte problems, and reverse assembly puzzles under strict 15-minute timers.',
    rules: [
      'Solo contestants only.',
      'Languages: C++, Rust, Python3, Go.',
      'Single elimination 64-coder bracket.'
    ],
    prizes: {
      first: '$4,000 + Mechanical Cyber Keyboard & Trophy',
      second: '$2,000 + Ultra-wide Curvature Monitor',
      third: '$1,000 + Tech Book Bundles',
      total: '$7,000',
      perks: ['Direct Technical Interview Pass with Top Tech Partners']
    },
    teamSize: 'Solo Only',
    date: 'OCT 26, 2026',
    time: '11:00 - 15:00 UTC',
    venue: 'Sector 02 — Terminal Nexus',
    difficulty: 'Specialist',
    image: '/assets/iridescent_orb.jpg',
    tags: ['Algorithms', 'Rust', 'Data Structures', 'Speed Duel'],
    featured: false,
    registrationOpen: true,
    slotsRemaining: 24
  },
  {
    id: 'evt-neuro-interface',
    title: 'NEURAL LINK & BCI LAB',
    category: 'ai-quantum',
    categoryLabel: 'Neurotech Exhibition',
    tagline: 'Direct EEG brain-computer interface synthesis and thought-to-code hack.',
    description: 'Utilize 16-channel open-source EEG neuro-headsets to decode focus states, robotic arm movement through motor cortex imagery, and synthetic thought speech synthesis.',
    rules: [
      'Hardware provided by NeuroLink Academic Consortium.',
      'Teams of 2 to 3 operatives.',
      'Ethical AI and biometric data privacy safeguards required.'
    ],
    prizes: {
      first: '$5,000 + 2x Research-Grade EEG Headsets',
      second: '$2,500 + NeuroTech Grant',
      third: '$1,000 + Biometric Sensor Kit',
      total: '$8,500',
      perks: ['Incubation with NeuroVenture Labs']
    },
    teamSize: '2 - 3 Operatives',
    date: 'OCT 25 - 26, 2026',
    time: '12:00 - 18:00 UTC',
    venue: 'Sector 05 — Synaptic Pavilion',
    difficulty: 'Novice',
    image: '/assets/cyber_head.jpg',
    tags: ['BCI', 'EEG Signal Processing', 'Neurotech', 'Biometrics'],
    featured: false,
    registrationOpen: true,
    slotsRemaining: 15
  }
];

export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: 'spk-1',
    name: 'Dr.Manikant paswan',
    role: ' Chief Architect, Turing Core Labs',
    organization: 'Turing Core & Neuromancer Labs',
    topic: 'Architecting Post-AGI Synthetic Cognition & Multi-Agent Swarms',
    bio: 'Pioneered self-optimizing recursive neural models and spatial memory networks. Former lead researcher at CERN and deep-learning faculty fellow.',
    avatar: '/assets/mani.jpeg',
    day: 1,
    time: 'OCT 24 // 11:30 AM',
    tags: ['Artificial General Intelligence', 'Cognitive Swarms', 'Keynote'],
    social: {
      github: 'https://github.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'spk-2',
    name: 'Phungsuke Wangdu',
    role: 'envisioning Lead, CyberSwarm Labs',
    organization: 'CyberSwarm Autonomous Systems',
    topic: 'Micro-Drone Navigation in GPS-Denied Hostile Environments',
    bio: 'Creator of the decentralized bio-inspired drone swarming protocol used in subterranean mapping and extraterrestrial planetary simulations.',
    avatar: '/assets/spe1.jpeg',
    day: 2,
    time: 'OCT 25 // 14:00 PM',
    tags: ['Robotics', 'ROS2', 'Swarm Theory'],
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'spk-3',
    name: 'Dev Rostova',
    role: 'Principal Quantum Engineer',
    organization: 'Helios Quantum Institute',
    topic: 'Entanglement as a Compute Primitive: Surviving the Crypto Apocalypse',
    bio: 'Author of "Beyond RSA: Practical Lattice Cryptography on Hybrid QPU Clusters". Leading the global standard for quantum key distribution.',
    avatar: '/assets/spk2.jpeg',
    day: 2,
    time: 'OCT 25 // 16:30 PM',
    tags: ['Quantum Computing', 'Cryptography', 'Lattice Math'],
    social: {
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'spk-4',
    name: 'kartikeya singh',
    role: 'VP of Interactive Worlds',
    organization: 'Metaverse Nexus & CyberPlay',
    topic: 'Spatial Computing & Neural Latency in Next-Gen Cyber Esports',
    bio: 'Two-time world gaming champion turned neuro-gaming engineer, currently building optical neural controllers with sub-millisecond reaction buffers.',
    avatar: '/assets/spk4.jpg',
    day: 3,
    time: 'OCT 26 // 15:00 PM',
    tags: ['Spatial Tech', 'Haptics', 'Esports Tech'],
    social: {
      github: 'https://github.com',
      twitter: 'https://x.com'
    }
  }
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    day: 1,
    dateStr: 'OCTOBER 24, 2026',
    time: '09:00 - 10:30',
    title: 'Opening Ceremony: Initialization of the Matrix',
    category: 'all',
    location: 'Main Holographic Dome',
    description: 'Welcome address, keynote reveal, safety protocols, and release of the official Hackathon problem statements.',
    isLive: false
  },
  {
    id: 'sch-2',
    day: 1,
    dateStr: 'OCTOBER 24, 2026',
    time: '11:00 - 12:30',
    title: 'Keynote: Post-AGI Synthetic Cognition',
    speaker: 'Dr. Valery Thorne',
    category: 'hackathon',
    location: 'Sector 01 — Turing Core Arena',
    description: 'Deep dive into recursive neural networks, multi-agent frameworks, and building self-healing autonomous systems.',
    isLive: true
  },
  {
    id: 'sch-3',
    day: 1,
    dateStr: 'OCTOBER 24, 2026',
    time: '13:00 - ∞',
    title: 'Turing City Hackathon — Hacking Commences',
    eventId: 'evt-edge-agi',
    category: 'hackathon',
    location: 'All Virtual & Physical Quadrants',
    description: '48-hour continuous countdown starts. Squads claim developer pods, API credentials, and mentor desks.',
    isLive: false
  },
  {
    id: 'sch-4',
    day: 1,
    dateStr: 'OCTOBER 24, 2026',
    time: '16:00 - 21:00',
    title: 'Valorant Protocol: Group Stage Qualifiers',
    eventId: 'evt-neural-esports',
    category: 'esports',
    location: 'Sector 06 — Holographic Arena',
    description: 'Top 16 collegiate teams duel in double-elimination brackets with live holographic observer broadcast.',
    isLive: false
  },
  {
    id: 'sch-5',
    day: 2,
    dateStr: 'OCTOBER 25, 2026',
    time: '10:00 - 12:30',
    title: 'Quantum Circuit Masterclass & Qiskit Challenge',
    eventId: 'evt-quantum-core',
    speaker: 'Elena Rostova',
    category: 'ai-quantum',
    location: 'Sector 04 — Qubit Cleanroom',
    description: 'Hands-on hardware access to cloud-linked cryo-QPU rigs and algorithmic benchmarking.',
    isLive: false
  },
  {
    id: 'sch-6',
    day: 2,
    dateStr: 'OCTOBER 25, 2026',
    time: '13:30 - 18:30',
    title: 'Cyberswarm Robo-Wars: Grand Melee',
    eventId: 'evt-cyberswarm-bots',
    speaker: 'Kaito Tanaka',
    category: 'robotics',
    location: 'Sector 03 — Steel Coliseum',
    description: 'Autonomous combat bots and high-speed drone swarm time-trials through electrified ring obstacles.',
    isLive: false
  },
  {
    id: 'sch-7',
    day: 2,
    dateStr: 'OCTOBER 25, 2026',
    time: '23:00 - 02:00',
    title: 'Midnight Synthwave Rave & Secret Bounty Drops',
    category: 'all',
    location: 'Metaverse Chill Out Lounge',
    description: 'Live DJ set by GlitchCore with hidden easter eggs and \$2,000 in micro-bounties dropped every 30 minutes.',
    isLive: false
  },
  {
    id: 'sch-8',
    day: 3,
    dateStr: 'OCTOBER 26, 2026',
    time: '11:00 - 14:00',
    title: 'Singularity Speed Coding — 1v1 Elimination',
    eventId: 'evt-speed-battleground',
    category: 'coding',
    location: 'Sector 02 — Terminal Nexus',
    description: '64 contestants face off on stage on dual mirrored displays with audible keystroke audio feeds.',
    isLive: false
  },
  {
    id: 'sch-9',
    day: 3,
    dateStr: 'OCTOBER 26, 2026',
    time: '15:00 - 18:00',
    title: 'Finalist Demos & Exhibition Showcase',
    category: 'hackathon',
    location: 'Grand Amphitheater & Virtual VR Cast',
    description: 'The top 8 hackathon teams present their working prototypes in front of Silicon Valley angel investors.',
    isLive: false
  },
  {
    id: 'sch-10',
    day: 3,
    dateStr: 'OCTOBER 26, 2026',
    time: '18:30 - 20:30',
    title: 'Award Ceremony, Golden Tickets & Final Protocol Close',
    category: 'all',
    location: 'Main Holographic Dome',
    description: 'Trophy distribution, grant allocations, golden tickets to Helsinki, and official festival closing ceremony.',
    isLive: false
  }
];

export const MOCK_LEADERBOARD: LeaderboardTeam[] = [
  {
    id: 'ldr-1',
    rank: 1,
    prevRank: 2,
    name: 'NeuroVortex_AI',
    avatar: '⚡',
    university: 'MIT // CSAIL Quadrant',
    category: 'hackathon',
    score: 984,
    maxScore: 1000,
    solved: 14,
    status: 'deploying',
    winStreak: 6,
    badge: 'GRANDMASTER'
  },
  {
    id: 'ldr-2',
    rank: 2,
    prevRank: 1,
    name: 'CyberPhantoms',
    avatar: '👾',
    university: 'Stanford // Symbiosis Lab',
    category: 'hackathon',
    score: 962,
    maxScore: 1000,
    solved: 13,
    status: 'online',
    winStreak: 4,
    badge: 'DIAMOND'
  },
  {
    id: 'ldr-3',
    rank: 3,
    prevRank: 3,
    name: 'QuantumGlitchers',
    avatar: '🔮',
    university: 'Oxford // Quantum Foundry',
    category: 'hackathon',
    score: 928,
    maxScore: 1000,
    solved: 12,
    status: 'compiling',
    winStreak: 3,
    badge: 'ELITE'
  },
  {
    id: 'ldr-4',
    rank: 4,
    prevRank: 6,
    name: 'ZeroDay_Operatives',
    avatar: '🛡️',
    university: 'Carnegie Mellon // CyLab',
    category: 'hackathon',
    score: 895,
    maxScore: 1000,
    solved: 11,
    status: 'online',
    winStreak: 5,
    badge: 'SPECIALIST'
  },
  {
    id: 'ldr-5',
    rank: 5,
    prevRank: 4,
    name: 'Synapse_Overclock',
    avatar: '🧠',
    university: 'ETH Zürich // D-ITET',
    category: 'hackathon',
    score: 870,
    maxScore: 1000,
    solved: 10,
    status: 'online',
    winStreak: 2,
    badge: 'SPECIALIST'
  },

  
  {
    id: 'ldr-rob-1',
    rank: 1,
    prevRank: 1,
    name: 'MechaTitan_X',
    avatar: '🤖',
    university: 'Tokyo Tech // Robotics Lab',
    category: 'robotics',
    score: 990,
    maxScore: 1000,
    solved: 8,
    status: 'online',
    winStreak: 7,
    badge: 'APEX DESTROYER'
  },
  {
    id: 'ldr-rob-2',
    rank: 2,
    prevRank: 3,
    name: 'SwarmDynamics',
    avatar: '🛸',
    university: 'Georgia Tech // AeroSpace',
    category: 'robotics',
    score: 945,
    maxScore: 1000,
    solved: 7,
    status: 'deploying',
    winStreak: 3,
    badge: 'SWARM ACE'
  },
  {
    id: 'ldr-rob-3',
    rank: 3,
    prevRank: 2,
    name: 'IronValkyrie',
    avatar: '⚙️',
    university: 'Tsinghua // Dept of Automation',
    category: 'robotics',
    score: 910,
    maxScore: 1000,
    solved: 6,
    status: 'online',
    winStreak: 4,
    badge: 'TITAN'
  },

  
  {
    id: 'ldr-esp-1',
    rank: 1,
    prevRank: 1,
    name: 'Neon_Dynasty',
    avatar: '🎯',
    university: 'Seoul Cyber University',
    category: 'esports',
    score: 1240,
    maxScore: 1500,
    solved: 18,
    status: 'online',
    winStreak: 9,
    badge: 'IMMORTAL'
  },
  {
    id: 'ldr-esp-2',
    rank: 2,
    prevRank: 2,
    name: 'Vanguard_Ghosts',
    avatar: '👻',
    university: 'UC Berkeley // Cal Esports',
    category: 'esports',
    score: 1180,
    maxScore: 1500,
    solved: 16,
    status: 'online',
    winStreak: 5,
    badge: 'CHAMPION'
  },

  
  {
    id: 'ldr-cod-1',
    rank: 1,
    prevRank: 2,
    name: 'RustByte_Warrior',
    avatar: '🦀',
    university: 'Waterloo // Math & CS',
    category: 'coding',
    score: 995,
    maxScore: 1000,
    solved: 24,
    status: 'online',
    winStreak: 12,
    badge: 'SINGULARITY'
  },
  {
    id: 'ldr-cod-2',
    rank: 2,
    prevRank: 1,
    name: 'Algorithm_God',
    avatar: '⚡',
    university: 'IIT Bombay // CSE',
    category: 'coding',
    score: 980,
    maxScore: 1000,
    solved: 23,
    status: 'compiling',
    winStreak: 8,
    badge: 'GRANDMASTER'
  }
];

export const MOCK_FAQS = [
  {
    question: 'Who is eligible to participate in SYNAPSE 2026?',
    answer: 'Any university, college, or graduate student worldwide is welcome to participate! Both solo operatives and teams of up to 4 members are supported. High school students with coding experience may apply with parental consent.'
  },
  {
    question: 'What is the cost of registration and participation?',
    answer: 'SYNAPSE is 100% free for all qualified participants. All accepted hackers receive compute vouchers, hardware access in designated sectors, cyber swag packs, and complimentary meals throughout the 48 hours.'
  },
  {
    question: 'How do I generate and verify my Personalized CyberPass?',
    answer: 'Click "GET ACCESS PASS" on the header or hero section. Fill in your operative details and track preference. Your pass will be cryptographically minted with a scannable QR code and stored in your device storage.'
  },
  {
    question: 'Can I participate virtually if I cannot travel to Sector 07?',
    answer: 'Yes! All tracks have a designated Metaverse Hybrid Stream with discord developer pods, virtual mentor pairing, and live remote submission channels.'
  }
];

export const MOCK_WORKSHOPS: WorkshopItem[] = [
  {
    id: 'ws-agentic-agi',
    title: 'AUTONOMOUS MULTI-AGENT SWARMS WITH LANGGRAPH',
    sector: 'Sector 01 — Turing Core',
    track: 'hackathon',
    instructor: 'Dr. Valery Thorne',
    instructorRole: 'Chief Scientist, Turing Core Labs',
    instructorAvatar: '/assets/cyber_head.jpg',
    duration: '3.5 Hours',
    time: 'OCT 24 // 14:00 - 17:30 UTC',
    date: 'DAY 01 — OCT 24',
    venue: 'Lab Alpha-04 (Terminal Pod 12)',
    level: 'Advanced',
    capacity: 60,
    seatsRemaining: 14,
    tagline: 'Architect recursive self-healing LLM agent networks with shared memory & tool orchestration.',
    overview: 'Go beyond basic chat wrappers. In this intensive masterclass, attendees build multi-agent teams that coordinate via state graphs, execute verified code in sandboxed Docker containers, and autonomously debug production codebases.',
    prerequisites: ['Python 3.10+ Proficiency', 'Basic understanding of LLM APIs & Prompt Chains', 'Laptop with Docker installed'],
    syllabus: [
      { step: '01', title: 'State Graph Foundations', desc: 'Cyclic graphs, conditional routing, and persistent checkpointing.' },
      { step: '02', title: 'Hierarchical Supervisor Pattern', desc: 'Deploying planner agents that delegate subtasks to specialist coder agents.' },
      { step: '03', title: 'Human-in-the-Loop & Breakpoints', desc: 'Safeguards for autonomous database queries and live code execution.' },
      { step: '04', title: 'Edge Deployment with Ollama & Cloudflare', desc: 'Compiling local small models (Llama 3.2 3B) for sub-50ms tool loops.' }
    ],
    hardwareKit: 'Dedicated GPU Cloud Instance + Anthropic Claude 3.5 API Token Voucher ($100 value)',
    image: '/assets/turing_city.png'
  },
  {
    id: 'ws-combat-robotics',
    title: 'HIGH-TORQUE ROBOTICS & ESC MOTOR TELEMETRY',
    sector: 'Sector 03 — Steel Coliseum',
    track: 'robotics',
    instructor: 'Kaito Tanaka',
    instructorRole: 'Founder, CyberSwarm Robotics',
    instructorAvatar: '/assets/iridescent_orb.jpg',
    duration: '4 Hours',
    time: 'OCT 25 // 09:30 - 13:30 UTC',
    date: 'DAY 02 — OCT 25',
    venue: 'Coliseum Fabrication Bench 07',
    level: 'Intermediate',
    capacity: 45,
    seatsRemaining: 6,
    tagline: 'Hands-on assembly of pneumatic flippers, brushless drive trains, and STM32 telemetry.',
    overview: 'Get grease and soldering iron smoke on your fingers. Each participant is assigned a combat chassis to wire high-output 6S LiPo power distribution, tune brushless electronic speed controllers (BLHeli32), and configure dual-failsafe RF radios.',
    prerequisites: ['Basic Electronics & Soldering familiarity', 'Safety goggles (provided on site)'],
    syllabus: [
      { step: '01', title: 'Power Electronics & LiPo Safety', desc: 'Surge currents up to 150A, anti-spark XT90 switches, and fuse ratings.' },
      { step: '02', title: 'BLHeli32 Firmware & Motor Timing', desc: 'Optimizing high-pole outrunners for instant low-RPM torque spikes.' },
      { step: '03', title: 'Pneumatic Valves & Kinetic Systems', desc: 'CO2 regulator mechanics, solenoid firing circuits, and weapon interlocks.' },
      { step: '04', title: 'Live Arena Test Drive', desc: 'Navigate obstacle courses with real-time telemetry back to your laptop.' }
    ],
    hardwareKit: 'Brushless Outrunner Motor + 60A ESC + STM32 Development Board (take-home kit)',
    image: '/assets/cyber_head.jpg'
  },
  {
    id: 'ws-quantum-circuits',
    title: 'QISKIT CRYO-COMPUTING & POST-QUANTUM KEY EXCHANGES',
    sector: 'Sector 04 — Qubit Cleanroom',
    track: 'ai-quantum',
    instructor: 'Elena Rostova',
    instructorRole: 'Principal Quantum Engineer, Helios Labs',
    instructorAvatar: '/assets/quantum_waves.jpg',
    duration: '3 Hours',
    time: 'OCT 25 // 15:00 - 18:00 UTC',
    date: 'DAY 02 — OCT 25',
    venue: 'Cleanroom Cryo-Terminal Suite B',
    level: 'Singularity',
    capacity: 50,
    seatsRemaining: 9,
    tagline: 'Execute genuine quantum circuits on IBM Quantum superconducting QPUs via cloud link.',
    overview: 'Demystify quantum entanglement, superdense coding, and error mitigation. We run real Bell-state benchmarks on dilution refrigerator QPUs, measure decoherence T1/T2 noise, and explore Kyber post-quantum cryptographic primitives.',
    prerequisites: ['Linear Algebra (matrices, eigenvectors)', 'Python / NumPy basics'],
    syllabus: [
      { step: '01', title: 'Qubit State Spaces & Bloch Spheres', desc: 'Hadamard, Pauli-X/Y/Z, CNOT and parametric Phase rotation gates.' },
      { step: '02', title: 'Circuit Optimization & Transpilation', desc: 'Mapping virtual circuits onto physical hardware coupling graphs.' },
      { step: '03', title: 'Zero-Noise Extrapolation (ZNE)', desc: 'Mitigating thermal and crosstalk noise on near-term NISQ hardware.' },
      { step: '04', title: 'Lattice-Based Cryptography', desc: 'Implementing ML-KEM (Kyber-768) encapsulation against Shor threats.' }
    ],
    hardwareKit: 'Direct Cloud QPU Compute Hours on IBM Quantum 127-Qubit Eagle Processor',
    image: '/assets/quantum_waves.jpg'
  },
  {
    id: 'ws-neuro-interfaces',
    title: 'NEURAL SIGNAL DECODING: EEG TO REAL-TIME GAMEPLAY',
    sector: 'Sector 06 — Holographic Arena',
    track: 'esports',
    instructor: 'Marcus Vance',
    instructorRole: 'VP of Interactive Worlds, CyberPlay',
    instructorAvatar: '/assets/portal_tunnel.png',
    duration: '3.5 Hours',
    time: 'OCT 26 // 10:00 - 13:30 UTC',
    date: 'DAY 03 — OCT 26',
    venue: 'Arena Neuro-Lab Pod 03',
    level: 'Intermediate',
    capacity: 40,
    seatsRemaining: 11,
    tagline: 'Stream 16-channel dry-electrode brain waves to trigger instant in-game weapon abilities.',
    overview: 'Bridge neuroscience and competitive gaming. Learn how fast Fourier transforms (FFT) extract Alpha/Beta bands for focus detection, decode Steady-State Visual Evoked Potentials (SSVEP) from flickering UI icons, and bind them to low-latency HID events.',
    prerequisites: ['Basic JavaScript / Python', 'Interest in Neurotech & Human-Computer Interaction'],
    syllabus: [
      { step: '01', title: 'EEG Signal Acquisition & 10-20 System', desc: 'Electrode placement, scalp impedance, and 50Hz notch filters.' },
      { step: '02', title: 'Real-Time Band Power Estimation', desc: 'FFT windows and streaming brainwave classification in Web Audio/WebSockets.' },
      { step: '03', title: 'SSVEP Optical Stimulus Design', desc: 'Generating 12Hz/15Hz contrast flicker triggers on high-refresh OLED panels.' },
      { step: '04', title: 'Neuro-Triggered Gaming Demo', desc: 'Play a custom cyberpunk speed arena using only focus and brainwaves.' }
    ],
    hardwareKit: 'OpenBCI Compatible Signal Amplifier Board + Dry Electrode Sensor Patch',
    image: '/assets/portal_tunnel.png'
  }
];

export const MOCK_SPONSORS: SponsorItem[] = [
  {
    id: 'sp-nvidia',
    name: 'NVIDIA Quantum & Omniverse',
    tier: 'singularity',
    tierLabel: 'SINGULARITY TITLE PARTNER',
    logo: '🟢',
    tagline: 'Accelerating the frontier of spatial computing and accelerated computing.',
    description: 'NVIDIA powers the global AI revolution. For SYNAPSE 2026, NVIDIA provides participants with direct access to H100 Hopper Tensor Core clusters, cuQuantum simulation libraries, and Omniverse USD digital twin kits.',
    bountyTitle: 'NVIDIA Omniverse Spatial AI & cuQuantum Challenge',
    bountyAmount: '$12,500',
    bountyDetails: 'Build an autonomous spatial AI agent or quantum circuit simulation that leverages cuQuantum or Isaac Sim. Top team receives $10,000 + Golden Ticket travel grant.',
    perks: ['Exclusive Hopper H100 Compute Hours', 'On-Site Solutions Architect Mentorship', 'Direct Interviews for AI Research Fellowships'],
    hiringRoles: ['Research Scientist — Deep Learning', 'Quantum Algorithm Engineer', 'Compiler Optimization Intern'],
    boothLocation: 'Booth S-01 // Central Holographic Plaza',
    promoCode: 'NVIDIA-SYNAPSE-H100-BOUNTY',
    badgeColor: 'border-emerald-400 text-emerald-300'
  },
  {
    id: 'sp-anthropic',
    name: 'Anthropic Labs',
    tier: 'singularity',
    tierLabel: 'SINGULARITY TITLE PARTNER',
    logo: '⚡',
    tagline: 'Frontier AI safety, constitutional intelligence & autonomous systems.',
    description: 'Creators of Claude, Anthropic is dedicated to building reliable, interpretable, and steerable AI systems. Sponsor of the flagship Turing City hackathon track with $500/team in API credits.',
    bountyTitle: 'Constitutional Multi-Agent Safety Bounty',
    bountyAmount: '$10,000',
    bountyDetails: 'Develop automated red-teaming agents or constitutional guardrail architectures that prevent jailbreaks and hallucination cascades in autonomous multi-agent pipelines.',
    perks: ['Claude 3.5 Sonnet & Haiku Enterprise API Keys', '1-on-1 Office Hours with Alignment Researchers', 'Priority Review for Residency Programs'],
    hiringRoles: ['Alignment Researcher', 'Systems Infrastructure Engineer', 'Member of Technical Staff'],
    boothLocation: 'Booth S-02 // Sector 01 Turing Core',
    promoCode: 'ANTHROPIC-CLAUDE-SYNAPSE',
    badgeColor: 'border-pink-400 text-pink-300'
  },
  {
    id: 'sp-neuralink',
    name: 'Neuralink Core',
    tier: 'apex',
    tierLabel: 'APEX RESEARCH PARTNER',
    logo: '🧠',
    tagline: 'High-bandwidth brain-computer interfaces to restore autonomy.',
    description: 'Pioneering ultra-high channel count intracranial neural implants. Sponsoring the NeuroLink BCI laboratory track with telemetry analyzers and biometric signal tooling.',
    bountyTitle: 'Neural Decoding & Thought-to-Action Protocol',
    bountyAmount: '$7,500',
    bountyDetails: 'Best pipeline extracting motor intention from high-noise multichannel biological signal streams with sub-10ms inference latency.',
    perks: ['Research BCI Hardware kits', 'Direct Engineering AMA Session', 'Fast-Track Technical Interviews'],
    hiringRoles: ['Firmware Engineer — Implantable Silicon', 'Neuro-Signal Processing Scientist'],
    boothLocation: 'Booth A-01 // Sector 05 Synaptic Pavilion',
    promoCode: 'NEURALINK-SYNAPSE-2026',
    badgeColor: 'border-purple-400 text-purple-300'
  },
  {
    id: 'sp-supabase',
    name: 'Supabase Matrix',
    tier: 'apex',
    tierLabel: 'APEX CLOUD PARTNER',
    logo: '⚡',
    tagline: 'The open source Firebase alternative with enterprise pgvector & edge storage.',
    description: 'Supabase gives every hacker instantaneous Postgres, Vector embeddings, realtime WebSocket sync, and edge authentication in 30 seconds.',
    bountyTitle: 'Most Innovative High-Throughput Vector App',
    bountyAmount: '$5,000',
    bountyDetails: 'Build real-time multiplayer or edge applications leveraging pgvector and Supabase Realtime channels with zero latency.',
    perks: ['Free Pro Tier Plan for 1 Year for All Hackers', 'Custom Supabase Cyber Swag Packs', 'Founders Circle Mentorship'],
    hiringRoles: ['Fullstack Rust/TypeScript Engineer', 'Database Kernel Hacker'],
    boothLocation: 'Booth A-02 // Developer Pod 03',
    promoCode: 'SUPABASE-SYNAPSE-PRO',
    badgeColor: 'border-cyan-400 text-cyan-300'
  },
  {
    id: 'sp-cloudflare',
    name: 'Cloudflare Workers & AI',
    tier: 'apex',
    tierLabel: 'APEX INFRASTRUCTURE PARTNER',
    logo: '☁️',
    tagline: 'The global network running serverless V8 isolates in 330+ cities.',
    description: 'Powering the edge of the internet. Sponsor of high-speed DNS, DDoS shields, Workers AI serverless GPU inference, and Vectorize indexes.',
    bountyTitle: 'Zero-Cold-Start Global Edge Hack',
    bountyAmount: '$5,000',
    bountyDetails: 'Deploy a global service on Workers AI and Durable Objects achieving sub-20ms latency worldwide.',
    perks: ['Unlimited Workers AI Inference Credits', 'Global Network Pass', 'Dev Tooling Grants'],
    hiringRoles: ['Systems Engineer (Rust/C++)', 'Developer Relations Advocate'],
    boothLocation: 'Booth A-03 // Network Operations Hub',
    promoCode: 'CLOUDFLARE-EDGE-SYNAPSE',
    badgeColor: 'border-amber-400 text-amber-300'
  },
  {
    id: 'sp-rigetti',
    name: 'Rigetti Computing',
    tier: 'quantum',
    tierLabel: 'QUANTUM HARDWARE PARTNER',
    logo: '❄️',
    tagline: 'Modular multi-chip superconducting quantum processors.',
    description: 'Providing cloud access to Ankaa-class 84-qubit processors for cryogenic quantum circuit benchmarks.',
    bountyTitle: 'Best Quantum Annealing & Optimization Alg',
    bountyAmount: '$3,500',
    bountyDetails: 'Optimize graph coloring or traveling salesperson routing using hybrid quantum-classical QAOA.',
    perks: ['QPU Cloud Hours Voucher', 'Co-Authored Research Whitepaper Opportunity'],
    hiringRoles: ['Quantum Software Engineer', 'Cryogenic Hardware Tech'],
    boothLocation: 'Booth Q-01 // Sector 04 Qubit Cleanroom',
    promoCode: 'RIGETTI-ANKAA-QUANTUM',
    badgeColor: 'border-blue-400 text-blue-300'
  },
  {
    id: 'sp-bostondynamics',
    name: 'Boston Dynamics SDK',
    tier: 'quantum',
    tierLabel: 'ROBOTICS ALLIANCE PARTNER',
    logo: '🐕',
    tagline: 'Mobility, dexterity, and autonomy in legged robots.',
    description: 'Supplying Spot SDK development simulators and perception payload APIs for collegiate roboticists.',
    bountyTitle: 'Autonomous Rough-Terrain Swarm Navigation',
    bountyAmount: '$4,000',
    bountyDetails: 'Best autonomous obstacle negotiation demo using ROS2 vision nodes and path planning.',
    perks: ['Access to Spot Quadruped on Arena Floor', 'Robotics Hardware Swag'],
    hiringRoles: ['Controls Engineer', 'Robotics Software Intern'],
    boothLocation: 'Booth Q-02 // Sector 03 Steel Coliseum',
    promoCode: 'SPOT-AUTONOMOUS-ROBOTICS',
    badgeColor: 'border-yellow-400 text-yellow-300'
  },
  {
    id: 'sp-keychron',
    name: 'Keychron Cybernetic Gear',
    tier: 'hardware',
    tierLabel: 'HARDWARE & SPEED CODING PARTNER',
    logo: '⌨️',
    tagline: 'Ultra-custom mechanical keyboards with custom QMK/VIA firmware.',
    description: 'Outfitting the Singularity Speed Coding arena with hall-effect magnetic switches and custom aluminum boards.',
    bountyTitle: 'Singularity Duelist Champion Trophy Gear',
    bountyAmount: '10x Custom Q-Series Keyboards ($2,500 value)',
    bountyDetails: 'Awarded to top 10 finalists of the 1v1 Algorithmic Blitz battleground.',
    perks: ['Exclusive 30% Off Voucher for All Registered Operatives'],
    hiringRoles: ['Mechanical Hardware Designer', 'Firmware Engineer'],
    boothLocation: 'Booth H-01 // Terminal Nexus Stage',
    promoCode: 'KEYCHRON-SYNAPSE-30',
    badgeColor: 'border-slate-400 text-slate-300'
  }
];

export const MOCK_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Ankit Pandey',
    callsign: 'NEXUS_PRIME',
    role: 'Convenor & Executive Director',
    division: 'Supreme Directorate // Council Alpha',
    clearance: 'LEVEL 5 // SINGULARITY',
    avatar: '/assets/ankitr.png',
    bio: 'Lead organizer steering 64 university delegations, industry partnerships, and academic hackathon tracks. Former winner of DARPA Autonomous Cyber Challenge.',
    skills: [
      { name: 'Strategic Coordination', level: 98 },
      { name: 'Quantum Consortium', level: 92 },
      { name: 'Security Architecture', level: 95 },
      { name: 'Crisis Response', level: 90 }
    ],
    achievements: [
      'Grew SYNAPSE from 200 to 1,200+ global participants',
      'Secured $75,000 cash bounty escrow with NVIDIA & Anthropic',
      'Orchestrated multi-campus fiber optical WAN for zero-latency arena'
    ],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'aiden_prime#0001'
  },
  {
    id: 'tm-2',
    name: 'Alok',
    callsign: 'CYBER_ARCHITECT',
    role: 'Chief Technology Officer',
    division: 'Platform & Infrastructure Grid',
    clearance: 'LEVEL 4 // MATRIX',
    avatar: '/assets/alok.jpeg',
    bio: 'Architected the high-throughput scoring engine, WebSockets telemetry feed, and 3D metaverse streaming platform. Open-source maintainer in distributed systems.',
    skills: [
      { name: 'Distributed Systems', level: 96 },
      { name: 'Three.js / WebGL', level: 94 },
      { name: 'Realtime Infrastructure', level: 98 },
      { name: 'Smart Contracts', level: 88 }
    ],
    achievements: [
      'Sub-15ms live leaderboard sync for 5,000 concurrent sockets',
      'Custom zero-knowledge pass verification protocol',
      'Wrote the custom Web Audio synth engine for festival UI'
    ],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'seraphina_code#1024'
  },
  {
    id: 'tm-3',
    name: 'RiteshRaj',
    callsign: 'IRON_COMMANDER',
    role: 'Head of Combat Robotics & Arena Safety',
    division: 'Steel Coliseum & Mecha Division',
    clearance: 'LEVEL 4 // ARMORED',
    avatar: '/assets/ritesh.jpeg',
    bio: 'Former BattleBots quarterfinalist and mechanical engineering lead. Designed the electrified steel combat octagon with Lexan polycarbonate blast shields.',
    skills: [
      { name: 'Kinetic Weaponry', level: 99 },
      { name: 'High-Current ESCs', level: 93 },
      { name: 'Pneumatics & Hydraulics', level: 95 },
      { name: 'Arena Safety Protocols', level: 97 }
    ],
    achievements: [
      'Zero safety breaches across 3 combat robotics seasons',
      'Constructed dual 15kg featherweight battle arenas',
      'Standardized optical radio failsafes for autonomous drones'
    ],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'novak_mech#8888'
  },
  {
    id: 'tm-4',
    name: 'Aman Pankaj',
    callsign: 'SPATIAL_VORTEX',
    role: 'Creative Director & 3D Spatial Designer',
    division: 'Visual Identity & Metaverse Arts',
    clearance: 'LEVEL 4 // NEON',
    avatar: '/assets/turing_city.png',
    bio: 'Pioneering sci-fi graphic design, cybernetic UI/UX, and generative shaders. Lead artist behind the Turing City and Monogrid visual identity.',
    skills: [
      { name: '3D Art & Shaders', level: 97 },
      { name: 'Cyberpunk UI/UX', level: 99 },
      { name: 'Motion Graphics', level: 94 },
      { name: 'Generative Typography', level: 92 }
    ],
    achievements: [
      'Awarded Best Interactive Web Design at CyberArts 2025',
      'Created custom 3D holographic foil ticket renderer',
      'Direction of the midnight synthwave metaverse rave visual stage'
    ],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'zara_vortex#7777'
  },
  {
    id: 'tm-5',
    name: 'Aman Bhardwaj',
    callsign: 'APEX_OPERATOR',
    role: 'Head of Esports Matrix & Low-Latency Broadcast',
    division: 'Collegiate Tactical Gaming',
    clearance: 'LEVEL 4 // IMMORTAL',
    avatar: '/assets/aman.jpeg',
    bio: 'Oversees the 16-team Valorant Protocol tournament, 360Hz player workstations, observer camera systems, and multi-platform 4K 60FPS broadcast.',
    skills: [
      { name: 'Optical Network Routing', level: 95 },
      { name: 'Esports Tournament Ops', level: 98 },
      { name: 'Broadcast Engineering', level: 92 },
      { name: 'Anti-Cheat Telemetry', level: 91 }
    ],
    achievements: [
      'Peak concurrent viewership of 48,000 across regional channels',
      'Zero frame drop during double-elimination grand finals',
      'Secured hardware sponsorship from HyperX and Alienware'
    ],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'jinwoo_apex#4321'
  },
  {
    id: 'tm-6',
    name: 'Suraj',
    callsign: 'QUANTUM_SYNAPSE',
    role: 'Deep Tech & Academic Research Director',
    division: 'Cryo-Quantum & BCI Laboratories',
    clearance: 'LEVEL 4 // QUBIT',
    avatar: '/assets/suraj.jpeg',
    bio: 'PhD candidate in quantum information science. Coordinates cloud QPU reservations, hardware sponsor mentors, and judging rubrics for deep-tech prototypes.',
    skills: [
      { name: 'Quantum Cryptography', level: 96 },
      { name: 'Jury Coordination', level: 94 },
      { name: 'Academic Partnerships', level: 97 },
      { name: 'Ethics in AGI', level: 90 }
    ],
    achievements: [
      'Authored the official SYNAPSE 2026 problem bank',
      'Secured 12 academic mentors from CERN, MIT, and Oxford',
      'Curated the $25,000 publication and incubation grant pool'
    ],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'amara_qubit#9009'
  }
];

export const MOCK_QUADRANTS: SectorQuadrant[] = [
  {
    id: 'sec-01',
    sectorCode: 'SECTOR // 01',
    name: 'TURING CORE ARENA',
    zone: 'North Quadrant — Level 3',
    type: 'Autonomous Multi-Agent AI & Hackathon Headquarters',
    capacity: '400 Hacker Workstations + 24 GPU Pods',
    status: 'ACTIVE',
    description: 'The heartbeat of the 48-hour continuous hackathon. High-density power grids, dual gigabit fiber drops per table, and private squad debugging breakout rooms.',
    keyEvents: ['Turing City Hackathon', 'Autonomous Multi-Agent Workshop', 'Finalist Demos']
  },
  {
    id: 'sec-02',
    sectorCode: 'SECTOR // 02',
    name: 'TERMINAL NEXUS',
    zone: 'East Wing — Main Amphitheater',
    type: 'Speed Coding & Algorithmic Duel Stage',
    capacity: '200 Stage Seats + Dual Mirrored 8K Jumbotrons',
    status: 'ACTIVE',
    description: 'High-stakes 1v1 battleground where speed programmers duel on mirrored displays with audible keystrokes and real-time AST complexity analysis.',
    keyEvents: ['Singularity Speed Coding', 'Keynote: Dr. Valery Thorne', 'Closing Ceremony']
  },
  {
    id: 'sec-03',
    sectorCode: 'SECTOR // 03',
    name: 'STEEL COLISEUM',
    zone: 'South Quadrant — Industrial Hangar',
    type: 'Combat Robotics Octagon & Drone Obstacle Dome',
    capacity: '350 Spectators + Blast-Proof Polycarbonate Enclosure',
    status: 'ACTIVE',
    description: 'Reinforced 10mm Lexan octagon with active flame-suppression, pneumatic charging stations, and 200fps high-speed battle review cameras.',
    keyEvents: ['Cyberswarm Robo-Wars', 'High-Torque Robotics Workshop', 'Autonomous Drone Swarm Blitz']
  },
  {
    id: 'sec-04',
    sectorCode: 'SECTOR // 04',
    name: 'QUBIT CLEANROOM',
    zone: 'Sub-Level 2 — Cryogenic Lab',
    type: 'Quantum Computation & Deep Tech Research Suite',
    capacity: '80 Researchers + Direct QPU Cloud Terminal Links',
    status: 'CALIBRATING',
    description: 'Electromagnetically shielded laboratory connected to dilution refrigerator testbeds and low-noise superconducting QPU emulators.',
    keyEvents: ['Quantum Protocol Hack', 'Qiskit Cryo-Computing Workshop', 'Elena Rostova Keynote']
  },
  {
    id: 'sec-05',
    sectorCode: 'SECTOR // 05',
    name: 'SYNAPTIC PAVILION',
    zone: 'West Atrium — Bio-Tech Concourse',
    type: 'Brain-Computer Interface & Neurotech Exhibition',
    capacity: '150 Attendees + 16 Shielded EEG Isolation Booths',
    status: 'ACTIVE',
    description: 'Zero-RF interference acoustic chambers designed for dry-electrode EEG recording, motor imagery calibration, and synthetic voice decoding.',
    keyEvents: ['NeuroLink BCI Hack', 'EEG Signal Decoding Workshop', 'Exhibition Demos']
  },
  {
    id: 'sec-06',
    sectorCode: 'SECTOR // 06',
    name: 'HOLOGRAPHIC ARENA',
    zone: 'Central Dome — Cyber Matrix',
    type: 'Tactical Cyber Esports & Spatial VR Arena',
    capacity: '500 Spectators + 16x 360Hz Competitive Rigs',
    status: 'ACTIVE',
    description: 'Tournament arena outfitted with OLED 360Hz displays, zero-latency noise-canceling headsets, and overhead holographic player stats.',
    keyEvents: ['Valorant Protocol Matrix', 'Marcus Vance Keynote', 'Midnight Synthwave Rave']
  }
];

export const MOCK_TIMELINE = [
  {
    year: '2022',
    edition: 'GENESIS I',
    tagline: 'The First Neural Link',
    hackers: '250 Operatives',
    breakthrough: 'First collegiate hackathon running decentralized smart contracts on campus testnet nodes.',
    prizePool: '$10,000'
  },
  {
    year: '2023',
    edition: 'SYNAPSE II',
    tagline: 'Autonomous Steel',
    hackers: '550 Operatives',
    breakthrough: 'Inauguration of the Steel Coliseum with autonomous combat bots and live biometric telemetry.',
    prizePool: '$25,000'
  },
  {
    year: '2024',
    edition: 'SYNAPSE III',
    tagline: 'The Edge of AGI',
    hackers: '850 Operatives',
    breakthrough: 'First LLM multi-agent autonomous competition judged by Silicon Valley frontier AI labs.',
    prizePool: '$45,000'
  },
  {
    year: '2026',
    edition: 'QUANTUM SINGULARITY (CURRENT)',
    tagline: 'Deep Tech & Post-AGI Horizons',
    hackers: '1,200+ Operatives',
    breakthrough: '64 Universities, cryo-quantum computing access, full 3D interactive metaverse and $75,000+ bounty pool.',
    prizePool: '$75,000+'
  }
];

