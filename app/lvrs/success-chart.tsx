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
  success: {
    label: 'Success',
    color: 'var(--chart-2)',
  },
  error: {
    label: 'Error',
    color: 'var(--chart-1)',
  },
};

export type SuccessChartProps = {
  result: LandValuationResult;
};

export function SuccessChart({ result }: SuccessChartProps) {
  const chartData = [
    {
      result: 'success',
      count: result.success,
      fill: 'var(--color-success)',
    },
    { result: 'error', count: result.error, fill: 'var(--color-error)' },
  ];

  const totalRows = result.total;

  const successRate = (result.success / result.total) * 100;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Processing result</CardTitle>
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
                          Rows
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
          Success rate of{' '}
          <strong className="font-semibold">{successRate.toFixed(2)}%</strong>
        </div>
      </CardFooter>
    </Card>
  );
}
