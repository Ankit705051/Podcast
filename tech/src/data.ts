import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Blocks,
  BrainCircuit,
  Clapperboard,
  Cpu,
  Earth,
  Gamepad2,
  Orbit,
  ScanEye,
  Shield,
  Sparkles,
  Swords,
  Workflow,
} from "lucide-react";

export type EventTrack = {
  id: string;
  name: string;
  district: string;
  category: string;
  day: string;
  time: string;
  venue: string;
  description: string;
  reward: string;
  icon: LucideIcon;
  accent: string;
};

export const eventTracks: EventTrack[] = [
  {
    id: "hackathon",
    name: "Riftbound",
    district: "The Forge",
    category: "Build · 24-hour hackathon",
    day: "12 MAR",
    time: "10:00 AM",
    venue: "Foundry Hall",
    description:
      "A fractured world needs inventive minds. Form a crew, ship a working prototype, and show how your idea opens a path forward.",
    reward: "Teams of 2–4 · Bring your own laptop",
    icon: Blocks,
    accent: "#9d7bff",
  },
  {
    id: "robotics",
    name: "Skybreak Circuit",
    district: "The Flight Deck",
    category: "Compete · robotics arena",
    day: "13 MAR",
    time: "11:30 AM",
    venue: "Aerial Arena",
    description:
      "Pilot a machine across a shifting arena of gates and gravity. Precision wins the round; creative engineering wins the crowd.",
    reward: "Teams of up to 4 · Hardware provided",
    icon: Swords,
    accent: "#62d7f1",
  },
  {
    id: "ctf",
    name: "Cipherwake",
    district: "The Quiet Vault",
    category: "Compete · capture the flag",
    day: "12 MAR",
    time: "2:00 PM",
    venue: "Vault 09",
    description:
      "Trace a signal through a simulated system. Solve original security challenges, collaborate, and leave the network safer than you found it.",
    reward: "Solo or teams of 2 · Beginner track available",
    icon: Shield,
    accent: "#f472b6",
  },
  {
    id: "ai-lab",
    name: "Echoes of Intelligence",
    district: "The Resonance Lab",
    category: "Workshop · responsible AI",
    day: "13 MAR",
    time: "10:00 AM",
    venue: "North Studio",
    description:
      "Build a tiny language model, explore its failure modes, and design better questions around the systems we teach to speak.",
    reward: "90 minutes · Laptops provided",
    icon: BrainCircuit,
    accent: "#f2c879",
  },
  {
    id: "climate",
    name: "Verdant Protocol",
    district: "The Glass Garden",
    category: "Create · climate design lab",
    day: "14 MAR",
    time: "9:30 AM",
    venue: "Glasshouse",
    description:
      "Join designers and engineers at the edge of the wild. Prototype a small, practical idea for a more liveable future.",
    reward: "Open entry · All materials included",
    icon: Earth,
    accent: "#b6ef94",
  },
  {
    id: "worlds",
    name: "Worlds in a Minute",
    district: "The Memory Bank",
    category: "Create · immersive worlds",
    day: "14 MAR",
    time: "1:00 PM",
    venue: "Projection Hall",
    description:
      "Make a one-minute window into a world that does not exist yet. Build, direct, or sound-design an original immersive short.",
    reward: "Solo or teams of 3 · Phones welcome",
    icon: Clapperboard,
    accent: "#9d7bff",
  },
];

export type ScheduleItem = {
  time: string;
  title: string;
  note: string;
  icon: LucideIcon;
  day: number;
};

export const schedule: ScheduleItem[] = [
  { time: "09:00", title: "Realm gate opens", note: "Main Courtyard · All pass holders", icon: Orbit, day: 1 },
  { time: "10:00", title: "Riftbound begins", note: "Foundry Hall · Team check-in", icon: Blocks, day: 1 },
  { time: "14:00", title: "Cipherwake: first signal", note: "Vault 09 · Beginner & open tracks", icon: ScanEye, day: 1 },
  { time: "17:30", title: "The first spark", note: "Opening showcase · Main stage", icon: Sparkles, day: 1 },
  { time: "10:00", title: "Echoes of Intelligence", note: "North Studio · Workshop W—01", icon: BrainCircuit, day: 2 },
  { time: "11:30", title: "Skybreak Circuit", note: "Aerial Arena · Qualifying rounds", icon: Swords, day: 2 },
  { time: "15:00", title: "Design the unreal", note: "North Studio · Immersive worldbuilding", icon: Workflow, day: 2 },
  { time: "19:00", title: "Night of the signal", note: "Floating Stage · Live visuals & sound", icon: AudioLines, day: 2 },
  { time: "09:30", title: "Verdant Protocol", note: "Glasshouse · Open-entry lab", icon: Earth, day: 3 },
  { time: "13:00", title: "Worlds in a Minute", note: "Projection Hall · Community showcase", icon: Clapperboard, day: 3 },
  { time: "16:00", title: "The closing transmission", note: "Main stage · Awards & farewells", icon: Cpu, day: 3 },
  { time: "17:30", title: "Until next time", note: "Main Courtyard · Final gate", icon: Gamepad2, day: 3 },
];

export const workshops = [
  { number: "W—01", title: "Echoes of Intelligence", type: "AI · Ethics · Build", description: "Create a tiny language model and learn to interrogate its blind spots.", length: "90 MIN" },
  { number: "W—02", title: "Rooms beyond reality", type: "3D · Worldbuilding", description: "Block out an impossible world, then build a doorway into it.", length: "2 HRS" },
  { number: "W—03", title: "Make the web weird", type: "Creative code · Motion", description: "A hands-on introduction to code as a creative instrument.", length: "2 HRS" },
];

export const packages = [
  {
    name: "Wanderer",
    price: "₹499",
    unit: "one day · one explorer",
    description: "Take the first path into the realm.",
    includes: ["One festival day", "Talks & open-world expo", "Choose any one event", "Digital field guide"],
  },
  {
    name: "Awakened",
    price: "₹1,199",
    unit: "all three days · one explorer",
    description: "The whole story, with room to get lost.",
    includes: ["All three festival days", "Priority workshop booking", "Access to every event", "Festival keepsake & showcase"],
    featured: true,
  },
  {
    name: "Party of Four",
    price: "₹3,599",
    unit: "all three days · four explorers",
    description: "More hands, more ideas, shared checkpoints.",
    includes: ["All three festival days × 4", "Priority workshop booking × 4", "Access to every event", "Four festival keepsakes"],
  },
];
