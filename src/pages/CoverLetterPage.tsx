import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CoverLetterPage = () => {
  const location = useLocation();
  const coverLetter = location.state?.coverLetter;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-2xl mx-auto space-y-16 pt-16 p-8">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold">
            <span className="span-gradient-text">Generated Cover Letter</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-white">
            Below is your generated cover letter. Please review it.
          </p>
        </div>
        <Card className="p-6">
          <CardContent>
            {coverLetter ? (
              <pre className="whitespace-pre-wrap">{coverLetter}</pre>
            ) : (
              <p>No cover letter content available. Please generate a cover letter first.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoverLetterPage;