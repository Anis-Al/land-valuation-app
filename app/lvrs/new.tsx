import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Title } from '@/general/title';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/dropzone';
import { useState } from 'react';
import { Link, redirect, useSubmit } from 'react-router';
import type { Route } from './+types/new';
import { parseFormData } from '@remix-run/form-data-parser';
import { compressCSV } from '@core/utils';
import { getCurrentUserId } from '@/auth';
import { createLandValuationRequest } from '@core/lvr';

export const RAW_FILE_MAX_SIZE = 1024 * 1024 * 50;

export async function action({ request }: Route.ActionArgs) {
  const formData = await parseFormData(request, {
    maxFiles: 1,
    maxFileSize: RAW_FILE_MAX_SIZE,
  });

  const file = formData.get('raw') as File;

  if (file.type !== 'text/csv') {
    throw 'Invalid file format';
  }

  const rawContents = await compressCSV(Buffer.from(await file.arrayBuffer()));

  const currentUserId = await getCurrentUserId(request);

  const lvr = await createLandValuationRequest({
    fileName: file.name,
    fileSize: file.size,
    rawContents,
    createdBy: currentUserId,
  });

  if (!lvr) {
    throw 'Cant create';
  }

  return redirect(`/land-valuation-requests/${lvr.id}`);
}

export default function () {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    setFiles(files);
    const formData = new FormData();
    formData.append('raw', files[0]);
    submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
      navigate: true,
    });
  };

  const submit = useSubmit();

  return (
    <div className="flex flex-col">
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

        <Title>New land valuation request</Title>
      </div>

      <div className="p-8">
        <Dropzone
          accept={{ 'text/csv': [] }}
          maxFiles={1}
          maxSize={RAW_FILE_MAX_SIZE}
          minSize={0}
          onDrop={handleDrop}
          onError={console.error}
          src={files}
          className="h-96"
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div>
    </div>
  );
}
