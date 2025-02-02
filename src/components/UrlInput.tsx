import { useState } from 'react';
import { FileText, Loader2, Download, MessageSquare } from 'lucide-react';
import { HfInference } from '@huggingface/inference';
import { useNavigate } from 'react-router-dom';

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const navigate = useNavigate();
  
  const [url, setUrl] = useState('');
  const [showLoad, setShowLoad] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [showViewButton, setShowViewButton] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [jobContent, setJobContent] = useState('');
  const [cvContent, setCvContent] = useState('');
  const [showInput, setShowInput] = useState(true);

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
    setShowLoad(e.target.value.trim() !== '');
  };

  const runStepSequence = async (steps: string[], finalAction?: () => void) => {
    for (const step of steps) {
      setCurrentStep(step);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    setCurrentStep(null);
    if (finalAction) finalAction();
  };

  const handleLoadClick = async () => {
    setShowLoad(false);
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
      setCurrentStep('Error fetching job description');
      setShowInput(true);
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

  const handleChatClick = () => {
    navigate('/chat', { 
      state: { 
        cvContent, 
        jobContent 
      } 
    });
  };

  return (
    <div className="relative">
      <div className="max-h-[74px] w-full p-6 rounded-lg bg-white/10 text-white border border-white/20 min-h-[70px] flex items-center justify-between">
        {showInput ? (
          <>
            <input
              type="url"
              placeholder="Paste job posting URL"
              className="flex-1 bg-transparent outline-none"
              value={url}
              onChange={handleUrlChange}
            />
            {showLoad && (
              <button
                onClick={handleLoadClick}
                className="ml-4 px-6 h-[64px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
              >
                <span>✨ Load</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {currentStep && (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="text-white">{currentStep}</span>
                </>
              )}
              {showFileUpload && !currentStep && (
                <span className="text-white">Upload your resume as PDF or text file</span>
              )}
              {showViewButton && !currentStep && !showFileUpload && (
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
                    className="px-6 h-[64px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition cursor-pointer flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Choose File</span>
                  </label>
                </div>
              )}
              {showViewButton && (
                <button
                  onClick={toggleCoverLetter}
                  className="px-6 h-[64px] bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  {showCoverLetter ? 'Hide Cover Letter' : 'View Cover Letter'}
                </button>
              )}
              {showViewButton && (
                <button
                  onClick={handleChatClick}
                  className="px-6 h-[64px] bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with AI</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
     
      {showCoverLetter && coverLetter && (
        <div className="mt-4 p-6 bg-white/10 rounded-lg text-white">
          <div className="flex justify-end mb-4 space-x-4">
            <button
              onClick={downloadPDF}
              className="px-6 h-[64px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
}
