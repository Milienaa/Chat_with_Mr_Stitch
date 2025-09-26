export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  user: User;
}

export interface ProjectChannel {
  id: string;
  name: string;
}

// New Action Point Types
export interface ActionPointTask {
  id: string;
  title: string;
  responsible: string;
  dueDate: string;
}

export interface ActionPointInsight {
  id: string;
  observation: string;
  author: string;
}

export interface ActionPointProblem {
  id: string;
  problem: string;
  responsible: string;
  dueDate: string;
}

export interface ActionPointQuestion {
  id: string;
  question: string;
  author: string;
}

// This is what the AI will return for a specific summary
export interface ExtractedAP {
  tasks?: ActionPointTask[];
  problems?: ActionPointProblem[];
  insights?: ActionPointInsight[];
  openQuestions?: ActionPointQuestion[];
}

// This is what the AI will return for a follow-up request
export interface FollowupResult {
  summary: string;
  accepted: string[];
  rejected: string[];
  disputedPoints: string;
  keyInsights: string[];
  openQuestions: string[];
  diffFromPrevious?: string;
  nextSteps: string;
}

// This will be the structure for the document state
export interface GeneratedDocument {
  title: string;
  summary: string;
  tasks: ActionPointTask[];
  problems: ActionPointProblem[];
  insights: ActionPointInsight[];
  openQuestions: ActionPointQuestion[];
}


export type StanceType = 'INITIATORS' | 'ENTHUSIASTS' | 'CRITICS' | 'NEUTRALS';

export interface ParticipantStance {
  stance: StanceType;
  participants: string[];
  summary: string;
}

export interface SentimentAnalysis {
  tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
  summary: string;
  participantStances?: ParticipantStance[];
}