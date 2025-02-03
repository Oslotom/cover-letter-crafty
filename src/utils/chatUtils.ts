export const truncateText = (text: string) => {
  const maxChars = 4000;
  return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
};

export const cleanAIResponse = (text: string): string => {
  let cleaned = text
    .replace(/You are.*?assistant\./g, '')
    .replace(/Based on the.*?below/g, '')
    .replace(/Resume:[\s\S]*?Job Description:/g, '')
    .replace(/Job Description:[\s\S]*/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/```.*?```/g, '')
    .replace(/\{.*?\}/g, '')
    .trim();

  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  cleaned = cleaned.replace(/^Assistant:|^Human:/g, '').trim();
  
  return cleaned;
};