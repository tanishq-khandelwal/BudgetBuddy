import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";
import { Button } from "@/components/ui/button";

type Props = {
  onUpload: (results: { data: string[][] }) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();

  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: { getRootProps: () => Record<string, unknown> }) => (
        <Button
          size="sm"
          {...getRootProps()}
          variant="outline"
          className="w-full lg:w-auto bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
        >
          <Upload className="size-4 mr-2" />
          Import
        </Button>
      )}
    </CSVReader>
  );
};
