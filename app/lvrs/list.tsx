import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Link, redirect } from 'react-router';
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
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon } from 'lucide-react';
import { z } from 'zod';

const FilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(999_999),
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
    console.log('Query result:', result);
    return result;
  } catch (error) {
    console.error('Loader error:', error);
    redirect('/');
  }
}
export default function ({ loaderData }: Route.ComponentProps) {
  const items = (loaderData as SearchResult<LandValuationRequest>)?.items || [];

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
    },
    {
      accessorKey: 'createdAt',
      header: 'Created at',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const baseLink = `/land-valuation-requests/${row.original.id}`;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-36">
              <DropdownMenuItem asChild>
                <Link to={`${baseLink}`}>Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>test</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col">
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

      <div className="container mx-auto py-10">
        {/* la table avec donnees */}
        <DataTable columns={columns} data={items} />
      </div>
    </div>
  );
}
