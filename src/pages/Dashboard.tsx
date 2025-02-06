import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from '@/components/FileUpload';
import { Tables } from '@/integrations/supabase/types';
import { JobApplicationsTable } from '@/components/JobApplicationsTable';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [cvContent, setCvContent] = useState('');
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);

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

    if (!error && data) {
      setApplications(data);
    }
  };

  const handleEditCoverLetter = (application: Tables<'applications'>) => {
    navigate('/job-processor', {
      state: {
        jobContent: application.job_description,
        cvContent: application.cv_content,
        sourceUrl: application.job_url,
        applicationId: application.id,
        shouldGenerateOnMount: false
      }
    });
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
          <h2 className="text-2xl font-semibold mb-4">Your Applications</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Job Title</th>
                  <th className="text-left p-4">Company</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{app.job_title}</td>
                    <td className="p-4">{app.company}</td>
                    <td className="p-4">{app.status}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCoverLetter(app)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Cover Letter
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <JobApplicationsTable />
        </section>
      </div>
    </div>
  );
}