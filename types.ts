export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskStatus = 'Open' | 'Mitigated' | 'Accepted' | 'Transferred' | 'Avoided';

export interface Risk {
  id: string;
  title: string;
  asset: string;
  threat: string;
  vulnerability: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  score: number; // likelihood * impact
  level: RiskLevel;
  owner: string;
  status: RiskStatus;
  treatmentPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  REGISTER = 'REGISTER',
  ASSESSMENT = 'ASSESSMENT',
}

export interface GeminiAnalysisResult {
  threats: string[];
  vulnerabilities: string[];
  suggestedControls: string[];
}
