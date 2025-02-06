import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tables } from '@/integrations/supabase/types';
import { JobApplicationsTable } from '@/components/JobApplicationsTable';

export default function Dashboard() {
  const navigate = useNavigate();
  const [cvContent, setCvContent] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
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
          <JobApplicationsTable />
        </section>
      </div>
    </div>
  );
}