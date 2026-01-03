import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CustomerNotesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const CustomerNotesInput: React.FC<CustomerNotesInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Add your special instructions, notes about the location, or any other details for the driver...",
  label = "Customer Notes"
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="customer-notes">{label}</Label>
      <Textarea
        id="customer-notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
      <p className="text-sm text-muted-foreground">
        These notes will be shared with the driver along with admin notes
      </p>
    </div>
  );
};

export default CustomerNotesInput;