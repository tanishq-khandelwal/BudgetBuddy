"use client";

import { useState } from "react";
import { Download, FileUp, Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadResults = { data: string[][] };

type Props = {
  onUpload: (results: UploadResults) => void;
};

const csvConfig = { skipEmptyLines: true };

/** Compact "Import CSV" button that opens the file picker. */
export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();

  return (
    <CSVReader
      onUploadAccepted={onUpload}
      config={csvConfig}
      accept=".csv,text/csv"
    >
      {({ getRootProps }: { getRootProps: () => Record<string, unknown> }) => (
        <Button variant="outline" {...getRootProps()}>
          <Upload />
          Import CSV
        </Button>
      )}
    </CSVReader>
  );
};

/** Big drag-and-drop zone for the first step of the import. */
export const UploadDropzone = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();
  const [dragging, setDragging] = useState(false);

  return (
    <CSVReader
      onUploadAccepted={(results: UploadResults) => {
        setDragging(false);
        onUpload(results);
      }}
      config={csvConfig}
      accept=".csv,text/csv"
      onDragOver={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
    >
      {({ getRootProps }: { getRootProps: () => Record<string, unknown> }) => (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <FileUp className="size-6" />
          </div>
          <p className="font-medium">
            {dragging
              ? "Drop your file to upload"
              : "Drag and drop a CSV file here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or choose a file from your device
          </p>
          <Button type="button" className="mt-5" tabIndex={-1}>
            <Upload />
            Choose file
          </Button>
        </div>
      )}
    </CSVReader>
  );
};

export const SampleCsvLink = () => (
  <a
    href="/sample-transactions.csv"
    download
    className="inline-flex h-10 items-center gap-2 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Download className="size-4" />
    Download a sample CSV
  </a>
);
