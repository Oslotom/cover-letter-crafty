import { Tables } from '@/integrations/supabase/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

type ApplicationStatus = "Wishlist" | "Applied" | "Interview" | "Offer" | "Rejected";

interface ApplicationStatusSelectProps {
  application: Tables<'applications'>;
  onStatusChange: () => void;
}

export const ApplicationStatusSelect = ({ 
  application, 
  onStatusChange 
}: ApplicationStatusSelectProps) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', application.id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    onStatusChange();
  };

  return (
    <select
      value={application.status || 'Wishlist'}
      onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
      className="bg-transparent px-1 py-1"
    >
      <option value="Wishlist">Wishlist</option>
      <option value="Applied">Applied</option>
      <option value="Interview">Interview</option>
      <option value="Offer">Offer</option>
      <option value="Rejected">Rejected</option>
    </select>
  );
};