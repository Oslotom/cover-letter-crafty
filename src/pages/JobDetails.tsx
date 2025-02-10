
import { useLocation, Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, ExternalLink, Info } from "lucide-react";

interface JobInfo {
  title: string;
  company: string;
  deadline: string;
}

interface LocationState {
  jobContent: string;
  jobInfo: JobInfo;
  sourceUrl: string;
}

const JobDetails = () => {
  const location = useLocation();
  const { jobContent, jobInfo, sourceUrl } = (location.state as LocationState) || { 
    jobContent: '', 
    jobInfo: { 
      title: 'Job Position',
      company: 'Company',
      deadline: 'Not specified'
    },
    sourceUrl: ''
  };

  // Extract key information from job content
  const getKeyDetails = () => {
    const details = [
      { label: "Position", value: jobInfo.title },
      { label: "Company", value: jobInfo.company },
      { label: "Application Deadline", value: jobInfo.deadline },
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/add">
            <Button variant="outline">
              Back to Add Job
            </Button>
          </Link>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{jobInfo.title}</h1>
              <div className="flex items-center text-muted-foreground">
                <Info className="w-4 h-4 mr-2" />
                <span>{jobInfo.company}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img
                src={`https://logo.clearbit.com/${jobInfo.company.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}.com`}
                alt={`${jobInfo.company} logo`}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Key Details</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getKeyDetails().map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {detail.label}
                      </TableCell>
                      <TableCell>
                        {detail.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Full Description</h2>
              <Card className="p-4 bg-card/50">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div className="text-foreground whitespace-pre-wrap">
                    {jobContent}
                  </div>
                </div>
              </Card>
            </div>

            {sourceUrl && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => window.open(sourceUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Post
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;
