import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'npm:@huggingface/inference';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, newMessage, cvContent, jobContent } = await req.json();

    const conversationHistory = messages
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const prompt = `You are a senior recruitment professional. Focus on providing specific advice based on the resume and job description content. Keep your responses concise (3-4 sentences) and always end with 2-3 relevant follow-up questions.

Resume Content:
${cvContent}

Job Description:
${jobContent}

Previous conversation:
${conversationHistory}

Based on this context, provide professional advice tailored to their situation.

User: ${newMessage}
Assistant:`;

    const hf = new HfInference("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");
    
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

    return new Response(
      JSON.stringify({ message: response.generated_text.trim() }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});