/**
 * RsvpStatusCard - Pie chart showing RSVP status breakdown
 * 160px SVG with colored segments and legend
 * @feature 022-dashboard-visual-metrics
 * @task T004, T013, T030-T037
 */

// RSVP status colors - Soft pastel palette with good contrast (T013)
const RSVP_COLORS = {
  pending: '#FFD4A3',    // To Be Sent - soft orange (action needed)
  invited: '#B8D4F7',    // Invited - soft blue (waiting)
  confirmed: '#B8D4B8',  // Confirmed - soft green (positive/yes)
  declined: '#F7C4D4',   // Declined - soft pink (negative/no)
} as const;

interface RsvpStatusCardProps {
  pending: number;      // To Be Sent (invitation_status = 'pending')
  invited: number;      // Awaiting response
  confirmed: number;
  declined: number;
  isLoading?: boolean;
}

// SVG specifications (T030)
const SVG_SIZE = 160;
const RADIUS = 60;
const CENTER = SVG_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PieSegment {
  color: string;
  percentage: number;
  rotation: number;
}

/**
 * Calculate pie chart segments (T031, T032)
 */
function calculateSegments(
  pending: number,
  invited: number,
  confirmed: number,
  declined: number
): PieSegment[] {
  const total = pending + invited + confirmed + declined;
  if (total === 0) return [];

  const segments: PieSegment[] = [];
  let currentRotation = 0;

  // Order: pending, confirmed, declined, invited (for visual balance)
  const data = [
    { count: pending, color: RSVP_COLORS.pending },
    { count: confirmed, color: RSVP_COLORS.confirmed },
    { count: declined, color: RSVP_COLORS.declined },
    { count: invited, color: RSVP_COLORS.invited },
  ];

  for (const item of data) {
    if (item.count > 0) {
      const percentage = (item.count / total) * 100;
      segments.push({
        color: item.color,
        percentage,
        rotation: currentRotation,
      });
      currentRotation += (percentage / 100) * 360;
    }
  }

  return segments;
}

/**
 * Loading skeleton (T036)
 */
function RsvpStatusSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6 animate-pulse">
      <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
      <div className="flex items-center justify-center">
        <div className="w-[160px] h-[160px] rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/**
 * Legend item component
 */
function LegendItem({
  color,
  label,
  count
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* 16px square color indicator (T033) */}
      <div
        className="w-4 h-4 rounded-sm flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900 ml-auto">({count})</span>
    </div>
  );
}

/**
 * RsvpStatusCard - Pie chart with legend
 */
export function RsvpStatusCard({
  pending,
  invited,
  confirmed,
  declined,
  isLoading = false,
}: RsvpStatusCardProps) {
  if (isLoading) {
    return <RsvpStatusSkeleton />;
  }

  const total = pending + invited + confirmed + declined;
  const segments = calculateSegments(pending, invited, confirmed, declined);

  // Build ARIA label (T037)
  const ariaLabel = `RSVP status breakdown: ${pending} to be sent, ${invited} invited, ${confirmed} confirmed, ${declined} declined`;

  // Handle edge case: no guests (T035)
  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">RSVP Status</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <div className="w-[160px] h-[160px] rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-sm text-center px-4">No guests added yet</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6"
      role="img"
      aria-label={ariaLabel}
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4">RSVP Status</h3>

      {/* SVG Pie Chart (T030-T032, T034) */}
      <div className="flex items-center justify-center">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-[160px] h-[160px]"
        >
          {segments.length === 1 ? (
            // Single status - full circle (T034)
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill={segments[0].color}
            />
          ) : (
            // Multiple segments using stroke-dasharray
            segments.map((segment, index) => {
              const segmentLength = (segment.percentage / 100) * CIRCUMFERENCE;
              const gapLength = CIRCUMFERENCE - segmentLength;

              return (
                <circle
                  key={index}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={RADIUS * 2}
                  strokeDasharray={`${segmentLength} ${gapLength}`}
                  transform={`rotate(${segment.rotation - 90} ${CENTER} ${CENTER})`}
                />
              );
            })
          )}
          {/* Center hole for donut effect */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS * 0.6}
            fill="white"
          />
          {/* Total count in center */}
          <text
            x={CENTER}
            y={CENTER}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold fill-gray-900"
            style={{ fontSize: '24px', fontWeight: 'bold' }}
          >
            {total}
          </text>
        </svg>
      </div>

      {/* Legend (T033) */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <LegendItem color={RSVP_COLORS.pending} label="To Be Sent" count={pending} />
        <LegendItem color={RSVP_COLORS.confirmed} label="Confirmed" count={confirmed} />
        <LegendItem color={RSVP_COLORS.invited} label="Invited" count={invited} />
        <LegendItem color={RSVP_COLORS.declined} label="Declined" count={declined} />
      </div>
    </div>
  );
}
