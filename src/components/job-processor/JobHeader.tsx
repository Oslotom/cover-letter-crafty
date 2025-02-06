interface JobHeaderProps {
  jobTitle: string;
  sourceUrl?: string;
}

export const JobHeader = ({ jobTitle, sourceUrl }: JobHeaderProps) => {
  return (
    <div className="text-center space-y-6">
      <p className="text-lg text-muted-foreground">Your Cover Letter</p>
      <h1 className="text-4xl font-bold">
        <span className="span-gradient-text">{jobTitle}</span>
      </h1>
      
      {sourceUrl && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" 
            className="hover:text-foreground transition-colors">
            {sourceUrl}
          </a>
        </div>
      )}
    </div>
  );
};