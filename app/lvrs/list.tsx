import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Link, redirect, useSearchParams } from 'react-router';
import { Title } from '../general/title';
import type { Route } from './+types/list';
import {
  findAllLandValuationRequests,
  LAND_VALUATION_REQUEST_STATUSES,
  type LandValuationRequest,
} from '@core/lvr';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/general/data-table';
import type { SearchResult } from '@core/lvr';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontalIcon,
  CalendarClockIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { z } from 'zod';
import { formatDateAndTime } from '@/lib/utils';
import { renderStatus } from './utils';
import { useFetcher } from 'react-router';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const FilterSchema = z.object({
  search: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).catch(1),
  pageSize: z.string().transform(Number).pipe(z.number().min(1)).catch(5),
  orderBy: z.enum(['createdAt']).default('createdAt'),
  orderByDir: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(LAND_VALUATION_REQUEST_STATUSES).array().optional(),
});

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const filter = FilterSchema.parse(
      Object.fromEntries(searchParams.entries())
    );
    const result = await findAllLandValuationRequests(filter);
    return result;
  } catch {
    redirect('/');
  }
}
export default function ({ loaderData }: Route.ComponentProps) {
  const items = (loaderData as SearchResult<LandValuationRequest>)?.items || [];
  const total = (loaderData as SearchResult<LandValuationRequest>)?.total || 0;
  const fetcher = useFetcher();
  const [itemToDelete, setItemToDelete] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const searchTerm = searchParams.get('search') || '';

  function deleteItem() {
    fetcher.submit(new FormData(), {
      action: `/land-valuation-requests/${itemToDelete}/delete`,
      method: 'delete',
    });
    setItemToDelete(undefined);
  }

  function searchItems(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  }
  function handlePagination(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  }

  const columns: ColumnDef<LandValuationRequest>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (row) => {
        return (
          <Link
            to={`/land-valuation-requests/${row.getValue()}`}
            className="underline decoration-1 decoration-dashed underline-offset-4"
          >
            <div className="flex gap-1 items-center">
              {row.getValue() as string}
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: 'fileName',
      header: 'File name',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return renderStatus(row.original.status);
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created at',
      cell: ({ row }) => {
        return (
          <div className="flex gap-1 items-center">
            <CalendarClockIcon className="w-4 h-4" />
            {formatDateAndTime(row.original.createdAt)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const baseLink = `/land-valuation-requests/${row.original.id}`;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2" asChild>
              <Button variant="ghost" size="sm">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-36">
              <DropdownMenuItem asChild>
                <Link to={`${baseLink}`}>Details</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setItemToDelete(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col">
      <AlertDialog open={itemToDelete !== undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to permanently delete this item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(undefined)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteItem}>
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>

          <Title>Land valuation requests</Title>
        </div>

        <Button variant="default" size="sm" asChild className="cursor-pointer">
          <Link to="/land-valuation-requests/new">New</Link>
        </Button>
      </div>
      <div className="flex justify-center items-center gap-2">
        <div className="relative w-80">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={searchItems}
            className="w-full pl-3 pr-10 py-2"
          />
          {!searchTerm ? (
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 cursor-pointer"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params);
              }}
            >
              ✕
            </Button>
          )}
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={items} />
        <div className="flex flex-col gap-2 mt-4">
          <div className='flex justify-end items-center gap-2'>
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => handlePagination(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            onClick={() => handlePagination(page + 1)}

          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          </div>
          <div className='text-sm flex justify-end py-4'>
            <span className='font-bold'>Total requests : </span>{total}</div>
        </div>
      </div>
    </div>
  );
}
