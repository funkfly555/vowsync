/**
 * RepurposingCard Component
 * @feature 014-repurposing-timeline
 * @task T017
 *
 * Card component displaying repurposing instruction details
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ArrowRight,
  Clock,
  MapPin,
  User,
  Building2,
  Wrench,
  PackageOpen,
  AlertTriangle,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { RepurposingStatusBadge } from './RepurposingStatusBadge';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';
import { convertTimeToFormFormat } from '@/schemas/repurposing';

interface RepurposingCardProps {
  instruction: RepurposingInstructionWithRelations;
  onEdit: () => void;
  onDelete: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onReportIssue?: () => void;
  onResume?: () => void;
}

export function RepurposingCard({
  instruction,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onReportIssue,
  onResume,
}: RepurposingCardProps) {
  const {
    wedding_items,
    from_event,
    to_event,
    vendors,
    pickup_location,
    pickup_time,
    pickup_time_relative,
    dropoff_location,
    dropoff_time,
    dropoff_time_relative,
    responsible_party,
    handling_notes,
    setup_required,
    breakdown_required,
    is_critical,
    status,
  } = instruction;

  return (
    <Card
      className={cn(
        'rounded-lg border shadow-sm',
        is_critical && 'border-l-2 border-l-red-500'
      )}
      role="article"
      aria-label={`Repurposing instruction for ${wedding_items.description}, status: ${status}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">
                {wedding_items.description}
              </h3>
              <span className="text-sm text-muted-foreground">
                ({wedding_items.category})
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{from_event.event_name}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{to_event.event_name}</span>
            </div>
          </div>
          <RepurposingStatusBadge status={status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pickup and Dropoff Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pickup */}
          <div className="space-y-1 p-3 bg-muted/50 rounded-md">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pickup
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {convertTimeToFormFormat(pickup_time)}
              </span>
              {pickup_time_relative && (
                <span className="text-sm text-muted-foreground">
                  ({pickup_time_relative})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{pickup_location}</span>
            </div>
          </div>

          {/* Dropoff */}
          <div className="space-y-1 p-3 bg-muted/50 rounded-md">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dropoff
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {convertTimeToFormFormat(dropoff_time)}
              </span>
              {dropoff_time_relative && (
                <span className="text-sm text-muted-foreground">
                  ({dropoff_time_relative})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{dropoff_location}</span>
            </div>
          </div>
        </div>

        {/* Responsible Party */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{responsible_party}</span>
          {vendors && (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="text-muted-foreground">{vendors.company_name}</span>
            </>
          )}
        </div>

        {/* Flags */}
        {(setup_required || breakdown_required || is_critical) && (
          <div className="flex items-center gap-4 text-sm">
            {breakdown_required && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <PackageOpen className="h-4 w-4" />
                <span>Breakdown</span>
              </div>
            )}
            {setup_required && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span>Setup</span>
              </div>
            )}
            {is_critical && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Critical</span>
              </div>
            )}
          </div>
        )}

        {/* Handling Notes Preview */}
        {handling_notes && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            <p className="line-clamp-2">{handling_notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            {/* Status Actions */}
            {status === 'pending' && onStart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStart}
                className="min-h-[44px]"
                aria-label={`Start moving ${wedding_items.description}`}
              >
                <Play className="h-4 w-4 mr-1" aria-hidden="true" />
                Start
              </Button>
            )}
            {status === 'in_progress' && onComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                className="min-h-[44px]"
                aria-label={`Mark ${wedding_items.description} as complete`}
              >
                <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                Complete
              </Button>
            )}
            {status !== 'issue' && status !== 'completed' && onReportIssue && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReportIssue}
                className="min-h-[44px] text-amber-600 hover:text-amber-700"
                aria-label={`Report issue with ${wedding_items.description}`}
              >
                <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                Issue
              </Button>
            )}
            {status === 'issue' && onResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResume}
                className="min-h-[44px]"
                aria-label={`Resume moving ${wedding_items.description}`}
              >
                <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
                Resume
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="min-h-[44px]"
              aria-label={`Edit ${wedding_items.description} repurposing instruction`}
            >
              <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="min-h-[44px] text-destructive hover:text-destructive"
              aria-label={`Delete ${wedding_items.description} repurposing instruction`}
            >
              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
