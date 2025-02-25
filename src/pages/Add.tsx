
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2 } from "lucide-react";
import { HfInference } from '@huggingface/inference';

interface JobInfo {
  title: string;
  company: string;
  deadline: string;
}

export default function Add() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const extractJobInfo = async (content: string) => {
    try {
      const hf = new HfInference("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");
      const prompt = `Extract the following information from the job posting and return it in this exact JSON format:
{
  "title": "Job Title Here",
  "company": "Company Name Here",
  "deadline": "Application Deadline Here"
  "summary": "Summary of description"
}

Job posting:
${content}`;

      console.log('Sending prompt to HF:', prompt);
      
      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.2,
          return_full_text: false
        }
      });

      console.log('Raw HF response:', response.generated_text);

      // Try to find JSON in the response using regex
      const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString);

      const jobInfo = JSON.parse(jsonString);

      // Validate the job info structure
      if (!jobInfo.title || !jobInfo.company) {
        throw new Error('Invalid job info structure');
      }

      return jobInfo;
    } catch (error) {
      console.error('Error extracting job info:', error);
      throw new Error(`Failed to extract job information: ${error.message}`);
    }
  };

  const handleLoadClick = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }
      
      const data = await response.json();
      if (!data.contents) {
        throw new Error('No content found in URL response');
      }
      
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      const scripts = doc.getElementsByTagName('script');
      const styles = doc.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      const textContent = doc.body.textContent || '';
      const cleanText = textContent.replace(/\s+/g, ' ').trim();
      
      if (!cleanText) {
        throw new Error('No text content found in webpage');
      }

      console.log('Clean text content:', cleanText.substring(0, 500) + '...');
      
      const jobInfo = await extractJobInfo(cleanText);
      console.log('Extracted job info:', jobInfo);
      
      navigate('/job-details', { 
        state: { 
          jobContent: cleanText,
          jobInfo,
          sourceUrl: url
        }
      });

    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load job posting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto space-y-8 pt-12 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            <span className="span-gradient-text">Add New Job</span>
          </h1>
          <p className="text-muted-foreground">
            Paste a job posting URL to get started
          </p>
        </div>

        <div className="w-full p-4 rounded-lg bg-black/5 dark:bg-white/10">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Input
                type="url"
                placeholder="Add link to job description here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>
            <Button
              onClick={handleLoadClick}
              variant="default"
              className="px-6 h-[50px] transition flex items-center gap-2
                bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
              disabled={!url || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              <span>Load</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
