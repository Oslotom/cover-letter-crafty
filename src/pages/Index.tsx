// pages/index.tsx
import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';

interface AnalysisResult {
  requirement: string;
  matchingExperience: string;
  gapAnalysis: string;
  score: number;
}

interface AnalysisData {
  requirements: AnalysisResult[];
  totalScore: number;
}

const AnalysisTable = ({ cvContent, jobContent }: { cvContent: string; jobContent: string }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (cvContent && jobContent) {
        try {
          setLoading(true);
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cvContent, jobContent }),
          });
          
          const data = await response.json();
          setAnalysis(data);
        } catch (err) {
          setError('Failed to analyze documents');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnalysis();
  }, [cvContent, jobContent]);

  if (loading) return <div className="text-white p-4 rounded-lg bg-gray-800">Analyzing documents...</div>;
  if (error) return <div className="text-red-500 p-4 rounded-lg bg-gray-800">{error}</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-white">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-4 text-left font-medium">Requirement/Skill</th>
            <th className="p-4 text-left font-medium">Matching Experience</th>
            <th className="p-4 text-left font-medium">Comments/Gap</th>
            <th className="p-4 text-left font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {analysis?.requirements?.map((req, index) => (
            <tr key={index} className="border-t border-gray-700 hover:bg-gray-800">
              <td className="p-4">{req.requirement}</td>
              <td className="p-4">{req.matchingExperience || 'Not found'}</td>
              <td className="p-4">{req.gapAnalysis}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span>{req.score}/6</span>
                  <div className="w-16 h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                      style={{ width: `${(req.score / 6) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        {analysis && (
          <tfoot className="bg-gray-800">
            <tr>
              <td className="p-4 font-bold" colSpan={3}>Total Match Score</td>
              <td className="p-4 font-bold">
                {analysis.totalScore}/{(analysis.requirements.length * 6)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-4xl mx-auto space-y-16 pt-16 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Cover Letter Generator
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Upload your CV and provide a job posting URL to generate a tailored cover letter with skills analysis
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">1. Job Posting URL</h2>
            <UrlInput onUrlContent={setJobContent} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">2. Upload Your CV</h2>
            <FileUpload onFileContent={setCvContent} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">3. Generate Cover Letter</h2>
            <CoverLetterGenerator
              cvContent={cvContent}
              jobContent={jobContent}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">4. Skills Match Analysis</h2>
            <AnalysisTable cvContent={cvContent} jobContent={jobContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;