type DashboardKpi<T> = {
  label: string;
  value: T;
};

export type DashboardKpis = {
  statusDist: DashboardKpi<{ status: string; count: number }[]>;
  avgProcessingTime: DashboardKpi<number | null>;
  totalProperties: DashboardKpi<number>;
  availableStates: DashboardKpi<Record<string, string[]>>;
};
