import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SegmentSelectorProps {
  availableSegments: string[];
  selectedSegment: string;
  onSelectedChange: (segment: string) => void;
}

export function SegmentSelector({ availableSegments, selectedSegment, onSelectedChange }: SegmentSelectorProps) {
  return (
    <Select value={selectedSegment} onValueChange={onSelectedChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select segment" />
      </SelectTrigger>
      <SelectContent>
        {availableSegments.map((segment) => (
          <SelectItem key={segment} value={segment}>
            {segment}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
