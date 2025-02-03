interface Message {
  role: 'user' | 'assistant';
  message: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};