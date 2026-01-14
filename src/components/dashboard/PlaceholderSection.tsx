interface PlaceholderSectionProps {
  title: string;
  message: string;
  showViewAll?: boolean;
}

/**
 * Placeholder section for features coming in future phases
 * Styled to match stat cards with optional grayed out "View All" link
 */
export function PlaceholderSection({ title, message, showViewAll = false }: PlaceholderSectionProps) {
  return (
    <div data-testid="placeholder-section">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {showViewAll && (
          <span className="text-sm text-gray-400 cursor-not-allowed">View All</span>
        )}
      </div>
      <div className="bg-white rounded-lg p-6 border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
