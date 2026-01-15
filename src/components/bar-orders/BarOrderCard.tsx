/**
 * BarOrderCard - Card component displaying bar order summary
 * @feature 012-bar-order-management
 * @task T014
 */

import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Wine, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarOrderStatusBadge } from './BarOrderStatusBadge';
import type { BarOrderWithRelations } from '@/types/barOrder';
import { calculateBarOrderSummary, formatCurrency } from '@/lib/barOrderCalculations';

interface BarOrderCardProps {
  order: BarOrderWithRelations;
  weddingId: string;
  onEdit?: (order: BarOrderWithRelations) => void;
  onDelete?: (order: BarOrderWithRelations) => void;
}

/**
 * Card component displaying bar order summary in list view
 * Shows order name, event, guest count, status, items count, and total cost
 */
export function BarOrderCard({
  order,
  weddingId,
  onEdit,
  onDelete,
}: BarOrderCardProps) {
  const navigate = useNavigate();
  const summary = calculateBarOrderSummary(order.items);

  const handleCardClick = () => {
    navigate(`/weddings/${weddingId}/bar-orders/${order.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(order);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(order);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate pr-2">{order.name}</h3>
            {order.event && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {order.event.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BarOrderStatusBadge status={order.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {order.guest_count_adults} guests
          </span>
          <span className="flex items-center gap-1">
            <Wine className="h-3.5 w-3.5" />
            {order.total_servings_per_person.toFixed(1)} servings/person
          </span>
        </div>

        {/* Items Summary */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-sm text-muted-foreground">
            {summary.itemCount === 0
              ? 'No items'
              : `${summary.itemCount} item${summary.itemCount !== 1 ? 's' : ''}`}
          </span>
          {summary.totalCost > 0 && (
            <span className="text-sm font-semibold">
              {formatCurrency(summary.totalCost)}
            </span>
          )}
        </div>

        {/* Vendor */}
        {order.vendor && (
          <p className="text-xs text-muted-foreground mt-2">
            Vendor: {order.vendor.business_name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
