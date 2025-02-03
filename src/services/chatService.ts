import { HfInference } from '@huggingface/inference';
import { supabase } from '@/integrations/supabase/client';
import { cleanAIResponse, truncateText } from '@/utils/chatUtils';

const hf = new HfInference("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");

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  cv_content?: string | null;
  job_content?: string | null;
}

export const chatService = {
  async processMessage(message: string, cvContent: string | null, jobContent: string | null): Promise<string> {
    let newJobContent = jobContent;
    
    if (message.startsWith('http')) {
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(message));
      const data = await response.json();
      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        newJobContent = doc.body.textContent?.trim() || null;
      }
    }

    const prompt = message.startsWith('http') && cvContent && newJobContent
      ? `Thanks for sharing! Here's a quick insight about the match between your resume and this job (max 50 words): ${truncateText(cvContent)} ${truncateText(newJobContent)}`
      : `Provide a brief response (max 50 words) to: ${message}`;

    const aiResponse = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: truncateText(prompt),
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true
      }
    });

    return cleanAIResponse(aiResponse.generated_text);
  },

  async processResume(content: string): Promise<string> {
    const prompt = `Provide a very brief analysis (max 50 words) of the key strengths in this resume: ${truncateText(content)}`;
    
    const aiResponse = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true
      }
    });

    return cleanAIResponse(aiResponse.generated_text);
  },

  async saveMessage(message: Message): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        ...message,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) throw error;
  }
};