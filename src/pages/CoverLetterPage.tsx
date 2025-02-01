import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CoverLetterPage = () => {
  const location = useLocation();
  const coverLetter = location.state?.coverLetter;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="max-w-2xl w-full p-6">
        <CardHeader>
          <CardTitle>Generated Cover Letter</CardTitle>
        </CardHeader>
        <CardContent>
          {coverLetter ? (
            <pre className="whitespace-pre-wrap">{coverLetter}</pre>
          ) : (
            <p>No cover letter content available. Please generate a cover letter first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoverLetterPage;
