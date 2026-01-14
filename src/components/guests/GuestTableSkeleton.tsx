/**
 * GuestTableSkeleton - Loading skeleton for guest table
 * @feature 006-guest-list
 * @task T045
 */

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GuestTableSkeletonProps {
  rowCount?: number;
}

export function GuestTableSkeleton({ rowCount = 5 }: GuestTableSkeletonProps) {
  return (
    <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
            <TableHead className="w-[50px] p-4">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead className="p-4">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="p-4">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="p-4">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="p-4">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="w-[100px] p-4">
              <Skeleton className="h-4 w-14" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="p-4">
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell className="p-4">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="p-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell className="p-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell className="p-4">
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="p-4">
                <Skeleton className="h-8 w-8 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
