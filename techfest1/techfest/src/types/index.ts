export type EventCategory = 
  | 'all' 
  | 'hackathon' 
  | 'robotics' 
  | 'esports' 
  | 'coding' 
  | 'ai-quantum';

export type PageTab = 'home' | 'about' | 'events' | 'schedule' | 'leaderboard' | 'workshops' | 'sponsors' | 'team';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  rules: string[];
  prizes: {
    first: string;
    second: string;
    third: string;
    total: string;
    perks?: string[];
  };
  teamSize: string;
  date: string;
  time: string;
  venue: string;
  difficulty: 'Novice' | 'Specialist' | 'Singularity';
  image: string;
  tags: string[];
  featured?: boolean;
  registrationOpen: boolean;
  slotsRemaining: number;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  topic: string;
  bio: string;
  avatar: string;
  day: number;
  time: string;
  tags: string[];
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface ScheduleItem {
  id: string;
  day: 1 | 2 | 3;
  dateStr: string;
  time: string;
  title: string;
  eventId?: string;
  category: EventCategory;
  location: string;
  speaker?: string;
  description: string;
  isLive?: boolean;
}

export interface LeaderboardTeam {
  id: string;
  rank: number;
  prevRank: number;
  name: string;
  avatar: string;
  university: string;
  category: 'hackathon' | 'robotics' | 'esports' | 'coding';
  score: number;
  maxScore: number;
  solved: number;
  status: 'online' | 'compiling' | 'deploying' | 'eliminated';
  winStreak?: number;
  badge: string;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  university: string;
  github: string;
  discord: string;
  track: EventCategory;
  teamName: string;
  teamSize: 'Solo' | 'Duo (2)' | 'Squad (3-4)';
  experience: 'Student' | 'Undergrad' | 'Postgrad' | 'Researcher';
}

export interface GeneratedPass {
  passId: string;
  participant: RegistrationData;
  issueDate: string;
  qrCodeUrl: string;
  clearanceLevel: string;
  registeredEvents: string[];
}

export interface WorkshopItem {
  id: string;
  title: string;
  sector: string;
  track: EventCategory;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  duration: string;
  time: string;
  date: string;
  venue: string;
  level: 'Intermediate' | 'Advanced' | 'Singularity';
  capacity: number;
  seatsRemaining: number;
  tagline: string;
  overview: string;
  prerequisites: string[];
  syllabus: { step: string; title: string; desc: string }[];
  hardwareKit: string;
  image: string;
}

export interface SponsorItem {
  id: string;
  name: string;
  tier: 'singularity' | 'apex' | 'quantum' | 'hardware';
  tierLabel: string;
  logo: string;
  tagline: string;
  description: string;
  bountyTitle: string;
  bountyAmount: string;
  bountyDetails: string;
  perks: string[];
  hiringRoles: string[];
  boothLocation: string;
  promoCode: string;
  badgeColor: string;
}

export interface TeamMember {
  id: string;
  name: string;
  callsign: string;
  role: string;
  division: string;
  clearance: string;
  avatar: string;
  bio: string;
  skills: { name: string; level: number }[];
  achievements: string[];
  github?: string;
  linkedin?: string;
  discord?: string;
}

export interface SectorQuadrant {
  id: string;
  sectorCode: string;
  name: string;
  zone: string;
  type: string;
  capacity: string;
  status: 'ACTIVE' | 'CALIBRATING' | 'RESTRICTED';
  description: string;
  keyEvents: string[];
}
