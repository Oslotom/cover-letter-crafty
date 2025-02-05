import { useLocation, Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, ExternalLink, Info } from "lucide-react";

interface LocationState {
  jobContent: string;
  jobTitle: string;
}

const JobDetails = () => {
  const location = useLocation();
  const { jobContent, jobTitle } = (location.state as LocationState) || { 
    jobContent: '', 
    jobTitle: 'Job Position' 
  };

  // Extract key information from job content
  const getKeyDetails = () => {
    const details = [
      { label: "Experience Level", value: extractExperience() },
      { label: "Employment Type", value: extractEmploymentType() },
      { label: "Location", value: extractLocation() },
      { label: "Skills Required", value: extractSkills() },
    ];
    return details;
  };

  const extractExperience = () => {
    const experienceMatch = jobContent.match(/(\d+[-\s]?\d*\+?\s*(?:year|yr)s?)/i);
    return experienceMatch ? experienceMatch[0] : "Not specified";
  };

  const extractEmploymentType = () => {
    const types = ["Full-time", "Part-time", "Contract", "Freelance", "Remote"];
    for (const type of types) {
      if (jobContent.toLowerCase().includes(type.toLowerCase())) {
        return type;
      }
    }
    return "Not specified";
  };

  const extractLocation = () => {
    // Simple location extraction (can be enhanced)
    const locationMatch = jobContent.match(/(?:located in|location:|based in)\s+([^\.]+)/i);
    return locationMatch ? locationMatch[1].trim() : "Not specified";
  };

  const extractSkills = () => {
    const commonSkills = [
      "JavaScript", "Python", "Java", "React", "Angular", "Vue", "Node.js",
      "SQL", "AWS", "Docker", "Kubernetes", "Git", "Agile", "Scrum"
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      jobContent.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills.join(", ") : "Not specified";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/job-processor">
            <Button variant="outline" className="text-white">
              Back to Job Processor
            </Button>
          </Link>
        </div>

        <Card className="p-6 mb-8 bg-white/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{jobTitle}</h1>
              <div className="flex items-center text-gray-300">
                <Info className="w-4 h-4 mr-2" />
                <span>Detailed Job Information</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Key Details</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-white">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getKeyDetails().map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-gray-300 font-medium">
                        {detail.label}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {detail.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Full Description</h2>
              <Card className="p-4 bg-white/5">
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {jobContent}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;