import { Label, Legend, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { LandValuationResult } from '@core/processor/model';

const chartConfig: ChartConfig = {
  count: {
    label: 'Count',
  },
  coords: {
    label: 'GPS',
    color: 'var(--chart-3)',
  },
  county: {
    label: 'County',
    color: 'var(--chart-5)',
  },
};

export type MatchingStrategyProps = {
  result: LandValuationResult;
};

export function MatchingStrategyChart({ result }: MatchingStrategyProps) {
  const chartData = [
    {
      result: 'coords',
      count: result.matchingStrategy.Coordinates,
      fill: 'var(--color-coords)',
    },
    {
      result: 'county',
      count: result.matchingStrategy.County,
      fill: 'var(--color-county)',
    },
  ];

  const totalRows = result.success;

  const successRate =
    (result.matchingStrategy.Coordinates / result.success) * 100;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Matching result</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square min-w-64 max-h-[250px]"
        >
          <PieChart>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) =>
                `${chartConfig[value].label} - ${entry.payload?.value.toLocaleString()}`
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="result"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalRows.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Matchings
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          GPS matching rate of{' '}
          <strong className="font-semibold">{successRate.toFixed(2)}%</strong>
        </div>
      </CardFooter>
    </Card>
  );
}
