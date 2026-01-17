/**
 * EmailCampaignList - List component for displaying campaigns
 * @feature 016-email-campaigns
 * @task T043
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { EmailCampaignCard } from './EmailCampaignCard';
import { useEmailCampaigns, type EmailCampaignsFilters } from '@/hooks/useEmailCampaigns';
import { Plus, Search, Mail, RefreshCw } from 'lucide-react';
import type { CampaignStatus } from '@/types/email';

interface EmailCampaignListProps {
  weddingId: string;
}

const statusOptions: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
];

/**
 * Campaign list with search, filtering, and creation action
 */
export function EmailCampaignList({ weddingId }: EmailCampaignListProps) {
  const [filters, setFilters] = useState<EmailCampaignsFilters>({});

  const { campaigns, isLoading, refetch } = useEmailCampaigns({
    weddingId,
    filters,
  });

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as CampaignStatus),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Email Campaigns</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage email campaigns for your wedding
          </p>
        </div>
        <Button asChild>
          <Link to={`/weddings/${weddingId}/emails/new`}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
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

      {/* Campaign list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.search || filters.status
              ? 'No campaigns match your filters'
              : 'No campaigns yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.status
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first email campaign to get started'}
          </p>
          {!filters.search && !filters.status && (
            <Button asChild>
              <Link to={`/weddings/${weddingId}/emails/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <EmailCampaignCard
              key={campaign.id}
              campaign={campaign}
              weddingId={weddingId}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {!isLoading && campaigns.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Showing {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
