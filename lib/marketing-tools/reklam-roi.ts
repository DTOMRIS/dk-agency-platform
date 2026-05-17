export type ReklamCampaignType = 'conversion' | 'awareness';

export type ReklamChannelType =
  | 'instagram_facebook'
  | 'google_ads'
  | 'influencer'
  | 'telegram'
  | 'whatsapp';

export type ReklamChannelInput = {
  id: string;
  type: ReklamChannelType;
  budget: number;
  newCustomers?: number;
  commissionPercent?: number;
  reach?: number;
  impressions?: number;
};

export type ReklamRoiInput = {
  campaignType: ReklamCampaignType;
  channels: ReklamChannelInput[];
  averageOrderValue: number;
  repeatPurchasePercent: number;
  organicValuePerReach: number;
};

export type ReklamHealthStatus = 'healthy' | 'weak' | 'harmful' | 'neutral';

export type ReklamConversionChannel = {
  id: string;
  type: ReklamChannelType;
  budget: number;
  commissionCost: number;
  effectiveBudget: number;
  newCustomers: number;
  revenue: number;
  cac: number;
  roas: number;
  roiPercent: number;
};

export type ReklamAwarenessChannel = {
  id: string;
  type: ReklamChannelType;
  budget: number;
  reach: number;
  impressions: number;
  cpm: number;
  emv: number;
};

export type ReklamRoiAnalysis = {
  campaignType: ReklamCampaignType;
  conversionChannels: ReklamConversionChannel[];
  awarenessChannels: ReklamAwarenessChannel[];
  totalBudget: number;
  totalRevenue: number;
  totalCustomers: number;
  totalReach: number;
  totalImpressions: number;
  totalEmv: number;
  totalRoiPercent: number;
  totalRoas: number;
  totalCac: number;
  ltv: number;
  ltvCacRatio: number;
  ltvCacStatus: ReklamHealthStatus;
  averageCpm: number;
  bestConversionChannel: ReklamConversionChannel | null;
  worstConversionChannel: ReklamConversionChannel | null;
  bestAwarenessChannel: ReklamAwarenessChannel | null;
  worstAwarenessChannel: ReklamAwarenessChannel | null;
};

export const REKLAM_CHANNEL_TYPES: ReklamChannelType[] = [
  'instagram_facebook',
  'google_ads',
  'influencer',
  'telegram',
  'whatsapp',
];

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function positive(value: number | undefined): number {
  return Math.max(0, Number.isFinite(value ?? 0) ? value ?? 0 : 0);
}

function ltvCacStatus(ratio: number): ReklamHealthStatus {
  if (ratio >= 3) return 'healthy';
  if (ratio >= 1) return 'weak';
  if (ratio > 0) return 'harmful';
  return 'neutral';
}

export function calculateReklamRoi(input: ReklamRoiInput): ReklamRoiAnalysis {
  const averageOrderValue = positive(input.averageOrderValue);
  const repeatRate = Math.min(95, Math.max(0, positive(input.repeatPurchasePercent))) / 100;
  const organicValuePerReach = positive(input.organicValuePerReach);

  const conversionChannels = input.channels
    .map((channel) => {
      const budget = positive(channel.budget);
      const newCustomers = Math.floor(positive(channel.newCustomers));
      const revenue = newCustomers * averageOrderValue;
      const commissionPercent = Math.min(50, Math.max(0, positive(channel.commissionPercent)));
      const commissionCost = channel.type === 'influencer'
        ? revenue * (commissionPercent / 100)
        : 0;
      const effectiveBudget = budget + commissionCost;

      return {
        id: channel.id,
        type: channel.type,
        budget: round(budget),
        commissionCost: round(commissionCost),
        effectiveBudget: round(effectiveBudget),
        newCustomers,
        revenue: round(revenue),
        cac: newCustomers > 0 ? round(effectiveBudget / newCustomers) : 0,
        roas: effectiveBudget > 0 ? round(revenue / effectiveBudget) : 0,
        roiPercent: effectiveBudget > 0 ? round(((revenue - effectiveBudget) / effectiveBudget) * 100) : 0,
      };
    })
    .filter((channel) => channel.effectiveBudget > 0);

  const awarenessChannels = input.channels
    .map((channel) => {
      const budget = positive(channel.budget);
      const reach = Math.floor(positive(channel.reach));
      const impressions = Math.floor(positive(channel.impressions));

      return {
        id: channel.id,
        type: channel.type,
        budget: round(budget),
        reach,
        impressions,
        cpm: impressions > 0 ? round((budget / impressions) * 1000) : 0,
        emv: round(reach * organicValuePerReach),
      };
    })
    .filter((channel) => channel.budget > 0);

  const totalBudget = round(conversionChannels.reduce((sum, channel) => sum + channel.effectiveBudget, 0)
    || awarenessChannels.reduce((sum, channel) => sum + channel.budget, 0));
  const totalRevenue = round(conversionChannels.reduce((sum, channel) => sum + channel.revenue, 0));
  const totalCustomers = conversionChannels.reduce((sum, channel) => sum + channel.newCustomers, 0);
  const totalReach = awarenessChannels.reduce((sum, channel) => sum + channel.reach, 0);
  const totalImpressions = awarenessChannels.reduce((sum, channel) => sum + channel.impressions, 0);
  const totalEmv = round(awarenessChannels.reduce((sum, channel) => sum + channel.emv, 0));
  const totalCac = totalCustomers > 0 ? round(totalBudget / totalCustomers) : 0;
  const totalRoas = totalBudget > 0 ? round(totalRevenue / totalBudget) : 0;
  const totalRoiPercent = totalBudget > 0 ? round(((totalRevenue - totalBudget) / totalBudget) * 100) : 0;
  const ltv = repeatRate >= 1 ? 0 : round(averageOrderValue * (1 / (1 - repeatRate)));
  const ltvCacRatio = totalCac > 0 ? round(ltv / totalCac) : 0;
  const averageCpm = totalImpressions > 0 ? round((totalBudget / totalImpressions) * 1000) : 0;

  const conversionSorted = [...conversionChannels].sort((a, b) => b.roas - a.roas);
  const awarenessSorted = [...awarenessChannels].sort((a, b) => a.cpm - b.cpm);

  return {
    campaignType: input.campaignType,
    conversionChannels,
    awarenessChannels,
    totalBudget,
    totalRevenue,
    totalCustomers,
    totalReach,
    totalImpressions,
    totalEmv,
    totalRoiPercent,
    totalRoas,
    totalCac,
    ltv,
    ltvCacRatio,
    ltvCacStatus: ltvCacStatus(ltvCacRatio),
    averageCpm,
    bestConversionChannel: conversionSorted[0] ?? null,
    worstConversionChannel: conversionSorted[conversionSorted.length - 1] ?? null,
    bestAwarenessChannel: awarenessSorted[0] ?? null,
    worstAwarenessChannel: awarenessSorted[awarenessSorted.length - 1] ?? null,
  };
}
