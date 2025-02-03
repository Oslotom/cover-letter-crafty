import { useEffect, useRef, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { HfInference } from '@huggingface/inference';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  cv_content?: string | null;
  job_content?: string | null;
}

const hf = new HfInference("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");

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jobContent, setJobContent] = useState<string | null>(null);
  const [cvContent, setCvContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        message: 'Hello! Please share a link to the job description you\'d like to discuss, or upload your resume so I can assist you better.'
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const truncateText = (text: string) => {
    const maxChars = 4000;
    return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: 'user', message };
      setMessages(prev => [...prev, userMessage]);

      let newJobContent = jobContent;
      
      if (message.startsWith('http')) {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(message));
        const data = await response.json();
        if (data.contents) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, 'text/html');
          newJobContent = doc.body.textContent?.trim() || null;
          setJobContent(newJobContent);
        }
      }

      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'user',
          message: message,
          job_content: newJobContent,
          cv_content: cvContent,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();

      if (chatError) throw chatError;

      let prompt = '';
      
      if (message.startsWith('http') && cvContent && newJobContent) {
        prompt = `Based on the following resume and job description, provide a brief and valuable insight (max 150 words) about the match between the candidate's profile and the job requirements. Start with "Thanks for sharing your resume and the job description. Here are some valuable insights:"

Resume: ${truncateText(cvContent)}

Job Description: ${truncateText(newJobContent)}`;
      } else {
        prompt = `You are a helpful AI assistant specializing in career advice. ${message}`;
      }

      const aiResponse = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        inputs: truncateText(prompt),
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      });

      const aiMessage = aiResponse.generated_text;

      const { error: assistantError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'assistant',
          message: aiMessage,
          job_content: newJobContent,
          cv_content: cvContent,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (assistantError) throw assistantError;

      setMessages(prev => [...prev, { role: 'assistant', message: aiMessage }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = async (content: string) => {
    try {
      setIsLoading(true);
      setCvContent(content);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: chatError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'user',
          message: 'Analyzing uploaded resume...',
          cv_content: content,
          user_id: user?.id
        }]);

      if (chatError) throw chatError;

      const prompt = `You are a helpful AI assistant specializing in career advice. Please analyze this resume and provide insights about the candidate's profile: ${truncateText(content)}`;
      
      const aiResponse = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      });

      const aiMessage = aiResponse.generated_text;

      const { error: assistantError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'assistant',
          message: aiMessage,
          cv_content: content,
          user_id: user?.id
        }]);

      if (assistantError) throw assistantError;

      setMessages(prev => [
        ...prev,
        { role: 'user', message: 'Analyzing uploaded resume...', cv_content: content },
        { role: 'assistant', message: aiMessage }
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process resume",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-4xl mx-auto p-8">
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold">
              <span className="span-gradient-text">AI Chat Assistant</span>
            </h1>
            <p className="text-white">Chat with our AI assistant about job postings and resumes</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 min-h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <MessageList messages={messages} />
              <div ref={messagesEndRef} />
            </div>
            
            <div className="space-y-4">
              <FileUpload onFileContent={handleFileContent} />
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;