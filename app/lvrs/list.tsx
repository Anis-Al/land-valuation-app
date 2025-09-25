import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Title } from '../general/title';

export default () => {
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
      </div>
    </div>
  );
};
