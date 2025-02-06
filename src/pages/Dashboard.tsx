import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ApplicationsTable } from '@/components/dashboard/ApplicationsTable';

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
          <ApplicationsTable 
            applications={applications}
            onStatusChange={fetchApplications}
          />
        </div>
      </div>
    </div>
  );
}