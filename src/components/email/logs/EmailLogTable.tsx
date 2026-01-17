/**
 * EmailLogTable - Table component for displaying email logs
 * @feature 016-email-campaigns
 * @task T035
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailStatusBadge } from '@/components/email/shared/EmailStatusBadge';
import { useEmailLogs, type EmailLogsFilters } from '@/hooks/useEmailLogs';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import type { EmailLog, EmailLogStatus } from '@/types/email';

interface EmailLogTableProps {
  campaignId?: string;
  weddingId?: string;
  onViewLog?: (log: EmailLog) => void;
}

const statusOptions: { value: EmailLogStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'soft_bounce', label: 'Soft Bounce' },
  { value: 'hard_bounce', label: 'Hard Bounce' },
  { value: 'failed', label: 'Failed' },
  { value: 'spam', label: 'Spam' },
];

/**
 * Email log table with filtering and pagination
 */
export function EmailLogTable({ campaignId, weddingId, onViewLog }: EmailLogTableProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EmailLogsFilters>({});
  const pageSize = 20;

  const { data, isLoading, refetch } = useEmailLogs({
    campaignId,
    weddingId,
    filters,
    page,
    pageSize,
  });

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as EmailLogStatus),
    }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by email or name..."
            className="pl-10"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Opened</TableHead>
              {onViewLog && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {onViewLog && <TableCell />}
                </TableRow>
              ))
            ) : data.logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={onViewLog ? 6 : 5}
                  className="text-center py-8 text-gray-500"
                >
                  No email logs found
                </TableCell>
              </TableRow>
            ) : (
              data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {log.recipient_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{log.recipient_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EmailStatusBadge status={log.status} type="log" size="sm" />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.sent_at ? format(new Date(log.sent_at), 'MMM d, h:mm a') : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.delivered_at
                      ? format(new Date(log.delivered_at), 'MMM d, h:mm a')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.opened_at
                      ? format(new Date(log.opened_at), 'MMM d, h:mm a')
                      : '-'}
                  </TableCell>
                  {onViewLog && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, data.totalCount)} of {data.totalCount} logs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
