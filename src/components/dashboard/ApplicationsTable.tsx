import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface ApplicationsTableProps {
  applications: Tables<'applications'>[];
  onStatusChange: () => void;
}

type ApplicationStatus = "Wishlist" | "Applied" | "Interview" | "Offer" | "Rejected";

export const ApplicationsTable = ({ applications, onStatusChange }: ApplicationsTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;

  const handleEditTitle = (app: Tables<'applications'>) => {
    setEditingId(app.id);
    setEditedTitle(app.job_title || '');
  };

  const handleSaveTitle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ job_title: editedTitle })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job title updated successfully",
      });
      
      onStatusChange();
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job title",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    onStatusChange();
  };

  const handleRowClick = (applicationId: string) => {
    if (!editingId) {
      navigate(`/cover-letter/${applicationId}`);
    }
  };

  const totalPages = Math.ceil(applications.length / rowsPerPage);
  const paginatedApplications = applications.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[75%]">Job Title</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[5%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedApplications.map((app) => (
            <TableRow 
              key={app.id} 
              className="h-14 cursor-pointer hover:bg-accent/50"
              onClick={() => handleRowClick(app.id)}
            >
              <TableCell>
                {editingId === app.id ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-sm"
                  />
                ) : (
                  app.job_title
                )}
              </TableCell>
              <TableCell>
                <select
                  value={app.status || 'Wishlist'}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(app.id, e.target.value as ApplicationStatus);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editingId === app.id) {
                      handleSaveTitle(app.id);
                    } else {
                      handleEditTitle(app);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  {editingId === app.id ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end text-xs items-center mt-4 px-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <span> {currentPage + 1} of {totalPages}</span>
        <Button
          variant="ghost"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
