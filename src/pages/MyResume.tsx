import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { HfInference } from '@huggingface/inference';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

const hf = new HfInference("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");

interface ResumeSection {
  title: string;
  content: Array<{ role?: string; company?: string; date?: string; description?: string; }>;
}

export default function MyResume() {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [name, setName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const { toast } = useToast();

  const truncateText = (text: string, maxLength: number = 10000): string => {
    return text.slice(0, maxLength);
  };

  const processResumeWithAI = async (content: string) => {
    try {
      const truncatedContent = truncateText(content);
      const prompt = `Extract and organize this resume content into clear sections. Return a JSON with this exact format:
{
  "header": { "name": "full name", "contact": "contact info" },
  "sections": [
    {
      "title": "section name",
      "content": [{ "role": "job title", "company": "company name", "date": "duration", "description": "brief description" }]
    }
  ]
}

Resume:
${truncatedContent}`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.1,
          return_full_text: false,
        },
      });

      try {
        const parsedResponse = JSON.parse(response.generated_text);
        if (parsedResponse.header) {
          setName(parsedResponse.header.name || '');
          setContact(parsedResponse.header.contact || '');
        }
        if (parsedResponse.sections) {
          setSections(parsedResponse.sections);
        }
      } catch (error) {
        console.error('Error parsing AI response:', error);
        toast({
          title: "Error",
          description: "Failed to parse the resume sections",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      toast({
        title: "Error",
        description: "Failed to process the resume",
        variant: "destructive",
      });
    }
  };

  const handleFileContent = (content: string) => {
    processResumeWithAI(content);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!sections.length && (
        <div className="mb-8">
          <FileUpload
            onFileContent={handleFileContent}
            contentType="cv"
            showSuccessInButton
          />
        </div>
      )}

      {sections.length > 0 && (
        <Card className="p-8 max-w-4xl mx-auto bg-white shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif mb-2">{name}</h1>
            <p className="text-gray-600">{contact}</p>
          </div>

          {sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-2xl font-serif mb-4 pb-2 border-b border-gray-200">
                {section.title}
              </h2>
              <Table>
                <TableBody>
                  {section.content.map((item, itemIndex) => (
                    <TableRow key={itemIndex}>
                      <TableCell className="align-top">
                        {item.role && (
                          <div className="font-semibold">{item.role}</div>
                        )}
                        {item.company && (
                          <div className="text-gray-600">{item.company}</div>
                        )}
                        {item.date && (
                          <div className="text-sm text-gray-500">{item.date}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.description && (
                          <div className="text-gray-700">{item.description}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}