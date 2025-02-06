import { Tables } from '@/integrations/supabase/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { ApplicationStatusSelect } from './ApplicationStatusSelect';
import { useNavigate } from 'react-router-dom';

interface ApplicationsTableProps {
  applications: Tables<'applications'>[];
  onStatusChange: () => void;
}

export const ApplicationsTable = ({ 
  applications,
  onStatusChange
}: ApplicationsTableProps) => {
  const navigate = useNavigate();

  const handleEditCoverLetter = (applicationId: string) => {
    navigate(`/cover-letter/${applicationId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{app.job_title}</TableCell>
            <TableCell>{app.company}</TableCell>
            <TableCell>
              <ApplicationStatusSelect 
                application={app}
                onStatusChange={onStatusChange}
              />
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditCoverLetter(app.id)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Cover Letter
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};