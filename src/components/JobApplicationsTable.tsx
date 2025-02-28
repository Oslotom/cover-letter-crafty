import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

type ApplicationStatus = "Wishlist" | "Applied" | "Interview" | "Offer" | "Rejected";

export function JobApplicationsTable() {
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleAddApplication = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      // Simulated AI response for now
      const jobData = {
        job_title: "Senior Software Engineer",
        company: "FINN",
        deadline: "Not specified",
      };

      const { error } = await supabase
        .from('applications')
        .insert({
          job_title: jobData.job_title,
          company: jobData.company,
          deadline: jobData.deadline,
          job_url: url,
          status: "Wishlist" as ApplicationStatus,
          user_id: session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job application added successfully",
      });

      setUrl('');
      setIsDialogOpen(false);
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error adding application",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

    fetchApplications();
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Job Applications</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Job Application</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Job posting URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={handleAddApplication} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="cursor-pointer" onClick={() => navigate(`/application/${app.id}`)}>
              <TableCell>{app.job_title}</TableCell>
              <TableCell>{app.company}</TableCell>
              <TableCell>{app.deadline}</TableCell>
              <TableCell>
                <select
                  value={app.status || 'Wishlist'}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(app.id, e.target.value as ApplicationStatus);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border rounded px-2 py-1"
                >
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}