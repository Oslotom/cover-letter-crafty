import { HfInference } from '@huggingface/inference';
import { supabase } from '@/integrations/supabase/client';
import { cleanAIResponse, truncateText } from '@/utils/chatUtils';

const hf = new HfInference("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");

export interface Message {
  role: 'user' | 'assistant';
  message: string;
  cv_content?: string | null;
  job_content?: string | null;
  content_type?: string | null;
}

export const chatService = {
  async processMessage(message: string, cvContent: string | null, jobContent: string | null): Promise<string> {
    const context = `
      ${cvContent ? `Resume Content: ${truncateText(cvContent)}` : ''}
      ${jobContent ? `Job Description: ${truncateText(jobContent)}` : ''}
    `;

    const prompt = `Given this context: ${context}
    
    Provide a brief, focused response (max 50 words) to this message: ${message}`;

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