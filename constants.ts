import { RiskLevel } from './types';

export const LIKELIHOOD_SCALE = [
  { value: 1, label: 'Rare' },
  { value: 2, label: 'Unlikely' },
  { value: 3, label: 'Possible' },
  { value: 4, label: 'Likely' },
  { value: 5, label: 'Certain' },
];

export const IMPACT_SCALE = [
  { value: 1, label: 'Negligible' },
  { value: 2, label: 'Minor' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Major' },
  { value: 5, label: 'Catastrophic' },
];

export const calculateRiskLevel = (score: number): RiskLevel => {
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-red-100 text-red-800 border-red-200',
};

export const RISK_STATUS_COLORS: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-800',
  Mitigated: 'bg-green-100 text-green-800',
  Accepted: 'bg-gray-100 text-gray-800',
  Transferred: 'bg-purple-100 text-purple-800',
  Avoided: 'bg-slate-100 text-slate-800',
};
