
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ApplicationsTable } from '@/components/dashboard/ApplicationsTable';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

export default function Dashboard() {
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    recent: 0
  });
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

    // Calculate statistics
    const total = data?.length || 0;
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    const recent = data?.filter(app => 
      new Date(app.created_at) > twentyDaysAgo
    ).length || 0;

    setStats({ total, recent });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-[#1a242f] dark:to-[#222f3a]">
      <div className="container max-w-2xl mx-auto space-y-8 pt-12 p-4">
        <div className="text-left space-y-4">
          <h1 className="text-4xl font-bold">
            <span className="span-gradient-text">Your Applications</span>
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
         
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
       
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 20 Days</p>
                <h3 className="text-2xl font-bold">{stats.recent}</h3>
              </div>
            </CardContent>
          </Card>
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
