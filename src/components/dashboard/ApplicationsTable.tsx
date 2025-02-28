
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { ApplicationStatusSelect } from './ApplicationStatusSelect';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface ApplicationsTableProps {
  applications: Tables<'applications'>[];
  onStatusChange: () => void;
}

export const ApplicationsTable = ({ 
  applications,
  onStatusChange
}: ApplicationsTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

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

  const handleRowClick = (applicationId: string) => {
    if (!editingId) {
      navigate(`/cover-letter/${applicationId}`);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-3/4">Job Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow 
            key={app.id} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(app.id)}
          >
            <TableCell className="py-4">
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
            <TableCell onClick={(e) => e.stopPropagation()}>
              <ApplicationStatusSelect 
                application={app}
                onStatusChange={onStatusChange}
              />
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingId === app.id) {
                    handleSaveTitle(app.id);
                  } else {
                    handleEditTitle(app);
                  }
                }}
                className="gap-2"
              >
                {editingId === app.id ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
