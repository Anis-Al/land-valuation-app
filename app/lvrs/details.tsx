import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Title } from '@/general/title';
import { Link, useFetcher } from 'react-router';
import { getCurrentUserId } from '@/auth';
import type { Route } from './+types/details';
import {
  findLandValuationRequest,
  findLandValuationRequestContents,
} from '@core/lvr';
import { redirect } from 'react-router';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { decompressCSV, loadCSVHeaders } from '@core/utils';
import { useState } from 'react';
import {
  type ColumnMapping,
  type ColumnMappingKey,
  DEFAULT_COLUMN_MAPPING,
} from '@core/processor/model';
import { ColumnSelect } from './column-select';
import { DownloadIcon, MoveHorizontalIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDateAndTime } from '@/lib/utils';
import { filesize } from 'filesize';
import { renderStatus } from './utils';

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const currentUserId = await getCurrentUserId(request);

    const lvr = await findLandValuationRequest(params.id);
    let columns: string[] | undefined = undefined;

    if (!lvr || lvr.createdBy !== currentUserId) {
      throw 'Not found';
    }

    if (lvr.status === 'Draft') {
      const contents = await findLandValuationRequestContents(lvr.id, 'raw');

      if (!contents) {
        throw 'Invalid raw contents';
      }

      columns = loadCSVHeaders(await decompressCSV(contents));
    }

    return {
      lvr,
      columns,
    };
  } catch {
    return redirect('/');
  }
}

export default function ({ loaderData }: Route.ComponentProps) {
  const { lvr, columns } = loaderData;
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(
    lvr.columnMapping ?? DEFAULT_COLUMN_MAPPING
  );

  const baseLink = `/land-valuation-requests/${lvr.id}`;

  const fetcher = useFetcher();

  function updateColumnMapping() {
    fetcher.submit(
      JSON.stringify({
        columnMapping,
      }),
      {
        action: `${baseLink}/column-mapping`,
        method: 'PUT',
        encType: 'application/json',
      }
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/land-valuation-requests">
                  Land valuation requests
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <Title subtitle={lvr.id}>Land valuation request</Title>
      </div>
      {lvr.status === 'Draft' && (
        <Card>
          <CardHeader>
            <CardTitle>Column mapping</CardTitle>
            <CardDescription>
              Please select the correct column sources
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(Object.keys(columnMapping) as ColumnMappingKey[]).map((key) => (
              <div key={key} className="flex gap-2">
                <Label className="uppercase w-24">{key}</Label>
                <ColumnSelect
                  items={columns!}
                  defaultValue={columnMapping[key]}
                  onChange={(value) => {
                    columnMapping[key] = value;

                    setColumnMapping({
                      ...columnMapping,
                    });
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={updateColumnMapping} className="cursor-pointer">
              Save
            </Button>
          </CardFooter>
        </Card>
      )}
      {lvr.status !== 'Draft' && (
        <div className="grid grid-cols-3 gap-4 justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Label>File name</Label>
                <span className="text-sm">{lvr.fileName ?? '-'}</span>
              </div>

              <div className="flex flex-col gap-2">
                <Label>File size</Label>
                <span className="text-sm">
                  {lvr.fileSize ? filesize(lvr.fileSize) : '-'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Date added</Label>
                <span className="text-sm">
                  {formatDateAndTime(lvr.createdAt)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                {renderStatus(lvr.status)}
              </div>

              <div className="flex justify-evenly gap-0">
                <Button
                  variant="ghost"
                  asChild
                  className="hover:bg-muted rounded-none"
                >
                  <Link to={`${baseLink}/download/raw`} reloadDocument>
                    <DownloadIcon className="w-4 h-4" />
                    <span>Raw</span>
                  </Link>
                </Button>
                {lvr.status === 'Complete' && (
                  <>
                    <Separator orientation="vertical" />
                    <Button
                      variant="ghost"
                      asChild
                      className="hover:bg-muted rounded-none"
                    >
                      <Link to={`${baseLink}/download/output`} reloadDocument>
                        <DownloadIcon className="w-4 h-4" />
                        <span>Full</span>
                      </Link>
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      variant="ghost"
                      asChild
                      className="hover:bg-muted rounded-none"
                    >
                      <Link to={`${baseLink}/download/refined`} reloadDocument>
                        <DownloadIcon className="w-4 h-4" />
                        <span>Refined</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {lvr.columnMapping && (
            <Card>
              <CardHeader>
                <CardTitle>Column mapping</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm">
                {(Object.keys(columnMapping) as ColumnMappingKey[]).map(
                  (key) => (
                    <div key={key} className="flex gap-2">
                      <span className="uppercase">{key}</span>
                      <MoveHorizontalIcon className="w-4 h-4" />
                      <span className="whitespace-nowrap">
                        {lvr.columnMapping![key]}
                      </span>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
