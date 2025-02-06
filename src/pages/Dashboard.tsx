import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tables } from '@/integrations/supabase/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);
  const [cvContent, setCvContent] = useState('');

  useEffect(() => {
    checkUser();
    fetchApplications();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    setApplications(data || []);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upload Resume</h2>
          <FileUpload 
            onFileContent={setCvContent} 
            contentType="cv"
            showSuccessInButton
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Cover Letters</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <Card 
                key={application.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/application/${application.id}`)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {application.job_title || 'Untitled Position'}
                  </CardTitle>
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
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {application.cover_letter}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}