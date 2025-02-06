import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

type ApplicationStatus = "Wishlist" | "Applied" | "Interview" | "Offer" | "Rejected";

export default function Dashboard() {
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchApplications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setApplications(data || []);
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

    fetchApplications();
  };

  const handleEditCoverLetter = (application: Tables<'applications'>) => {
    navigate('/job-processor', {
      state: {
        jobContent: application.job_description,
        cvContent: application.cv_content,
        sourceUrl: application.job_url,
        applicationId: application.id,
        currentCoverLetter: application.cover_letter,
        shouldGenerateOnMount: false
      }
    });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-[#1a242f] dark:to-[#222f3a]">
      <div className="container max-w-2xl mx-auto space-y-8 pt-12 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            <span className="span-gradient-text">Your Applications</span>
          </h1>
        </div>

        <div className="w-full">
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
                    <select
                      value={app.status || 'Wishlist'}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="bg-transparent border rounded px-2 py-1"
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
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCoverLetter(app)}
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
        </div>
      </div>
    </div>
  );
}