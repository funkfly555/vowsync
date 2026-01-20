/**
 * BudgetPieChart Component
 * @feature 011-budget-tracking
 * T029-T033: Pie chart visualization of budget breakdown
 *
 * FR-009: Pie chart with each category as a segment
 * FR-010: Display legend with category names and percentages
 */

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BudgetCategory } from '@/types/budget';
import { CHART_COLORS } from '@/types/budget';
import { formatCurrency } from '@/lib/budgetStatus';

interface BudgetPieChartProps {
  categories: BudgetCategory[];
  totalBudget: number;
}

interface ChartDataItem {
  [key: string]: string | number;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// Custom tooltip component - defined outside to avoid recreation during render
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataItem;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
        <p className="text-sm text-gray-500">{data.percentage.toFixed(1)}% of budget</p>
      </div>
    );
  }
  return null;
}

// Custom legend renderer - defined outside to avoid recreation during render
// T013-T017: Changed to 2-column grid layout to prevent overlap with many categories (023-dashboard-bug-fixes)
function renderLegend(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  chartData: ChartDataItem[]
) {
  const { payload } = props;
  if (!payload) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 max-h-[180px] overflow-y-auto">
      {payload.map((entry: { value: string; color: string }, index: number) => {
        const dataItem = chartData.find((d) => d.name === entry.value);
        return (
          <div key={`legend-${index}`} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 truncate">
              {entry.value} ({dataItem?.percentage.toFixed(0)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function BudgetPieChart({ categories, totalBudget }: BudgetPieChartProps) {
  const chartData: ChartDataItem[] = useMemo(() => {
    if (totalBudget === 0) return [];

    return categories
      .filter((cat) => cat.projected_amount > 0)
      .map((cat, index) => ({
        name: cat.category_name,
        value: cat.projected_amount,
        percentage: (cat.projected_amount / totalBudget) * 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [categories, totalBudget]);

  // Create legend content with access to chartData via closure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendContent = (props: any) => renderLegend(props, chartData);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">
            Add categories with projected amounts to see the breakdown chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Budget Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
              <Legend content={legendContent} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
