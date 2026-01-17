/**
 * EmailTemplateCard - Card component for displaying email template
 * @feature 016-email-campaigns
 * @task T017
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import type { EmailTemplate } from '@/types/email';
import { TEMPLATE_TYPE_LABELS } from '@/schemas/emailTemplate';
import { cn } from '@/lib/utils';

interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  onToggleActive?: (isActive: boolean) => void;
}

/**
 * Card component for displaying an email template
 * Shows template info with action dropdown menu
 */
export function EmailTemplateCard({
  template,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
  onToggleActive,
}: EmailTemplateCardProps) {
  return (
    <Card
      className={cn(
        'relative transition-all hover:shadow-md',
        !template.is_active && 'opacity-60'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">
                {template.template_name}
              </h3>
              {template.is_default && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Default
                </Badge>
              )}
              {!template.is_active && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {TEMPLATE_TYPE_LABELS[template.template_type]}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClone}>
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </DropdownMenuItem>
              {onSetDefault && !template.is_default && (
                <DropdownMenuItem onClick={onSetDefault}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Default
                </DropdownMenuItem>
              )}
              {onToggleActive && (
                <DropdownMenuItem
                  onClick={() => onToggleActive(!template.is_active)}
                >
                  {template.is_active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Subject preview */}
        <div className="mt-2">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            Subject:
          </p>
          <p className="text-sm text-gray-700 truncate mt-0.5">
            {template.subject}
          </p>
        </div>

        {/* Variables used */}
        {template.variables && template.variables.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Variables:</p>
            <div className="flex flex-wrap gap-1">
              {template.variables.slice(0, 5).map((v, idx) => (
                <code
                  key={idx}
                  className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600"
                >
                  {v}
                </code>
              ))}
              {template.variables.length > 5 && (
                <span className="text-xs text-gray-400">
                  +{template.variables.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-400">
          <span>
            Updated {format(new Date(template.updated_at), 'MMM d, yyyy')}
          </span>
          <span>
            Created {format(new Date(template.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
