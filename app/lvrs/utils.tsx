import { Badge } from '@/components/ui/badge';
import type { LandValuationRequestStatus } from '@core/lvr';

const STATUS_COLORS: { [key in LandValuationRequestStatus]: string } = {
  Draft: 'gray-600',
  Pending: 'orange-600',
  Processing: 'sky-600',
  Complete: 'green-600',
};

export function renderStatus(value: LandValuationRequestStatus) {
  const color = STATUS_COLORS[value];

  return (
    <Badge variant="outline" className={`border-${color} text-${color}`}>
      {value}
    </Badge>
  );
}
