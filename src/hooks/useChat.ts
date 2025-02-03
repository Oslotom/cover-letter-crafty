import { useState, useEffect, useRef } from 'react';
import { Message, chatService } from '@/services/chatService';
import { useToast } from '@/components/ui/use-toast';

export const useChat = () => {
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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: 'user', message };
      setMessages(prev => [...prev, userMessage]);

      await chatService.saveMessage(userMessage);

      const response = await chatService.processMessage(message, cvContent, jobContent);
      if (message.startsWith('http')) {
        setJobContent(response);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        message: response,
        job_content: jobContent,
        cv_content: cvContent
      };

      await chatService.saveMessage(assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
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
      
      const userMessage: Message = {
        role: 'user',
        message: 'Resume uploaded',
        cv_content: content
      };
      
      await chatService.saveMessage(userMessage);
      
      const response = await chatService.processResume(content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        message: response,
        cv_content: content
      };

      await chatService.saveMessage(assistantMessage);

      setMessages(prev => [
        ...prev,
        userMessage,
        assistantMessage
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

  return {
    messages,
    isLoading,
    handleSendMessage,
    handleFileContent,
    messagesEndRef
  };
};