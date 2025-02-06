import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  job_title: string;
  job_url: string;
  created_at: string;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Card 
            key={application.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/application/${application.id}`)}
          >
            <CardHeader>
              <CardTitle className="line-clamp-2">{application.job_title || 'Untitled Position'}</CardTitle>
              <CardDescription>
                <div className="text-sm text-muted-foreground mt-2">
                  {new Date(application.created_at).toLocaleDateString()}
                </div>
                {application.job_url && (
                  <div className="text-sm text-muted-foreground truncate mt-1">
                    {application.job_url}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}