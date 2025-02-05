import { useState, useEffect } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { HfInference } from '@huggingface/inference';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [showViewButton, setShowViewButton] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [jobContent, setJobContent] = useState('');
  const [cvContent, setCvContent] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const urlSteps = [
    'Opening website...',
    'Analysing job description',
    'Analyze complete. You can now upload your Resume'
  ];

  const fileSteps = [
    'Uploading Resume',
    'Analyzing Resume',
    'Analyse complete',
    'Generating cover letter',
    'Your cover letter is complete'
  ];

  const truncateText = (text: string) => {
    const maxChars = 4000;
    return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const runStepSequence = async (steps: string[], finalAction?: () => void) => {
    setIsProcessing(true);
    setCurrentStepIndex(0);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2 seconds
    }
    
    setCurrentStepIndex(0);
    setIsProcessing(false);
    if (finalAction) finalAction();
  };

  const handleLoadClick = async () => {
    if (!url.trim()) return;
    
    setShowInput(false);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) throw new Error('Failed to fetch URL content');
      
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      const scripts = doc.getElementsByTagName('script');
      const styles = doc.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      const textContent = doc.body.textContent || '';
      const cleanText = textContent.replace(/\s+/g, ' ').trim();
      
      setJobContent(cleanText);
      onUrlContent(cleanText);
      await runStepSequence(urlSteps, () => setShowFileUpload(true));
    } catch (error) {
      console.error('Error fetching URL:', error);
      setShowInput(true);
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/plain' && selectedFile.type !== 'application/pdf') {
      setCurrentStep('Error: Please upload a PDF or text file');
      return;
    }

    setFile(selectedFile);
    setShowFileUpload(false);
    
    try {
      const text = await selectedFile.text();
      setCvContent(text.trim());
      
      await runStepSequence(fileSteps, async () => {
        await generateCoverLetter(text.trim(), jobContent);
        setShowViewButton(true);
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setCurrentStep('Error processing file');
      setShowFileUpload(true);
    }
  };

  const generateCoverLetter = async (cv: string, job: string) => {
    try {
      const hf = new HfInference("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");
      
      const truncatedCV = truncateText(cv);
      const truncatedJob = truncateText(job);
      
      const prompt = `Create a concise and professional cover letter (max 250 words) based on the following CV and job description. Keep it short and consise. Output ONLY the cover letter text.

CV Summary:
${truncatedCV}

Job Summary:
${truncatedJob}

.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      const generatedText = response.generated_text.trim();
      setCoverLetter(extractCoverLetter(generatedText));
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setCurrentStep('Error generating cover letter');
    }
  };

  const extractCoverLetter = (text: string) => {
    const regex = /(Dear\s[a-zA-Z\s.]*,\n[\s\S]*?(Sincerely|Best regards|Regards|Yours sincerely|Respectfully),\n[a-zA-Z\s]*)/i;
    const match = text.match(regex);

    if (match) {
      return match[0].trim();
    }

    const startMarker = text.indexOf("Dear");
    const endMarker = text.lastIndexOf("Sincerely,") || text.lastIndexOf("Best regards,") || text.lastIndexOf("Regards,") || text.lastIndexOf("Yours sincerely,") || text.lastIndexOf("Respectfully,");

    if (startMarker !== -1 && endMarker !== -1) {
      return text.substring(startMarker, endMarker + 15).trim();
    } else if (startMarker !== -1) {
      return text.substring(startMarker).trim();
    }

    return text.trim();
  };

  const toggleCoverLetter = () => {
    setShowCoverLetter(!showCoverLetter);
  };

  const downloadPDF = async () => {
    if (!coverLetter) return;

    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="relative space-y-4">
      <div className="w-full p-6 rounded-lg bg-white/10 text-white border border-white/20 min-h-[70px]">
        {showInput ? (
          <div className="flex items-center gap-4">
            <input
              type="url"
              placeholder="Paste job posting URL"
              className="flex-1 bg-transparent outline-none"
              value={url}
              onChange={handleUrlChange}
            />
            <Button
              onClick={handleLoadClick}
              variant="secondary"
              className="px-6 h-[40px] hover:opacity-90 transition flex items-center gap-2"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Load</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {isProcessing && (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="text-white">{urlSteps[currentStepIndex]}</span>
                </>
              )}
              {showFileUpload && !isProcessing && (
                <span className="text-white">Upload your resume as PDF or text file</span>
              )}
              {showViewButton && !isProcessing && !showFileUpload && (
                <span className="text-white">Click to show your cover letter</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {showFileUpload && (
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".txt,.pdf"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-6 h-[40px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition cursor-pointer flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Choose File</span>
                  </label>
                </div>
              )}
              {showViewButton && (
                <Button
                  onClick={toggleCoverLetter}
                  className="px-6 h-[40px] bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  {showCoverLetter ? 'Hide Cover Letter' : 'View Cover Letter'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={((currentStepIndex + 1) / urlSteps.length) * 100} className="h-2" />
          <p className="text-sm text-white/70 text-center">
            Step {currentStepIndex + 1} of {urlSteps.length}
          </p>
        </div>
      )}
     
      {showCoverLetter && coverLetter && (
        <div className="mt-4 p-6 bg-white/10 rounded-lg text-white">
          <div className="flex justify-end mb-4">
            <Button
              onClick={downloadPDF}
              className="px-6 h-[40px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
          </div>
          <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
}
