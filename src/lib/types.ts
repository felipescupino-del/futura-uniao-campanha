import type { LucideIcon } from 'lucide-react';

export interface DashboardStats {
  totalBrokers: number;
  recovered: number;
  unresponsive: number;
  inactive: number;
  activeCampaigns: number;
  responseRate: number;
  messagesThisWeek: number;
  campaignsSummary: CampaignSummary[];
}

export interface CampaignSummary {
  id: number;
  name: string;
  responded: number;
  inProgress: number;
  noResponse: number;
}

export interface ActivityEvent {
  id: string;
  type: 'message_sent' | 'broker_responded';
  description: string;
  brokerName: string;
  campaignName: string;
  timestamp: string;
}

export interface CampaignDetail {
  id: number;
  name: string;
  description: string | null;
  status: string;
  totalSteps: number;
  basePrompt: string;
  createdAt: string;
  steps: CampaignStep[];
  brokers: CampaignBrokerEntry[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    responded: number;
    unresponsive: number;
  };
}

export interface CampaignStep {
  id: number;
  stepNumber: number;
  delayDays: number;
  promptOverride: string | null;
}

export interface CampaignBrokerEntry {
  id: number;
  currentStep: number;
  status: string;
  lastMessageAt: string | null;
  nextMessageAt: string | null;
  respondedAt: string | null;
  broker: {
    id: number;
    name: string;
    phone: string;
  };
  messages: MessageLogEntry[];
}

export interface MessageLogEntry {
  id: number;
  stepNumber: number;
  content: string;
  sentAt: string;
  status: string;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
  iconColor?: string;
}
