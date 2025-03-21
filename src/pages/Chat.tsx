
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { useChat } from '@/hooks/useChat';

const Chat = () => {
  const {
    messages,
    isLoading,
    handleSendMessage,
    handleFileContent,
    handleUrlContent,
    messagesEndRef
  } = useChat();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-8">
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold">
              <span className="span-gradient-text">AI Chat Assistant</span>
            </h1>
            <p className="text-foreground">Chat with our AI assistant about job postings and resumes</p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <FileUpload onFileContent={handleFileContent} contentType="cv" />
              <UrlInput onUrlContent={handleUrlContent} />
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-6 min-h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <MessageList messages={messages} />
              <div ref={messagesEndRef} />
            </div>
            
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
