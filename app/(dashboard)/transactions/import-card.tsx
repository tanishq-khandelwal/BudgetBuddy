import { useState } from "react";
import { format, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { convertAmountToMiliunits } from "@/lib/utils";
import { FileSpreadsheet, Info } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const dateFormat = "yyyy-MM-dd";
const outputFormat = "dd MMM yyyy";

const requiredOptions = ["amount", "date", "payee"];

interface SelectedColumnsState {
  [key: string]: string | null;
}

type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: unknown[]) => void;
};

export const ImportCard = ({ data, onCancel, onSubmit }: Props) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {},
  );

  const headers = data[0];
  const body = data.slice(1);

  // Initialize all rows as selected
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>(
    () => Object.fromEntries(body.map((_, index) => [index, true])),
  );

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null,
  ) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };

      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }

      if (value === "skip") {
        value = null;
      }

      newSelectedColumns[`column_${columnIndex}`] = value;
      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  const toggleRowSelection = (rowIndex: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const toggleAllRows = () => {
    const allSelected = Object.values(selectedRows).every(
      (selected) => selected,
    );
    setSelectedRows(
      Object.fromEntries(body.map((_, index) => [index, !allSelected])),
    );
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  const handleContinue = () => {
    const getColumnIndex = (column: string) => {
      return column.split("_")[1];
    };

    const mappedData = {
      headers: headers.map((_header, index) => {
        const columnIndex = `column_${index}`;
        return selectedColumns[columnIndex] || null;
      }),
      body: body
        .filter((row, index) => {
          // Filter out completely empty rows and unselected rows
          return (
            selectedRows[index] &&
            row.some((cell) => cell && cell.trim() !== "")
          );
        })
        .map((row) => {
          const transformedRow = row.map((cell, index) => {
            const columnIndex = `column_${index}`;
            return selectedColumns[columnIndex] ? cell : null;
          });

          return transformedRow.every((item) => item === null)
            ? []
            : transformedRow;
        })
        .filter((row) => row.length > 0),
    };

    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc: Record<string, string>, cell, index) => {
        const header = mappedData.headers[index];
        if (header !== null) {
          acc[header] = cell;
        }

        return acc;
      }, {});
    });

    const validData = arrayOfData.filter((item) => {
      // Filter out rows that don't have required fields
      return item.amount && item.date && item.payee;
    });

    const skippedRows = arrayOfData.length - validData.length;

    if (skippedRows > 0) {
      toast.warning(`Skipped ${skippedRows} empty or incomplete row(s)`);
    }

    if (validData.length === 0) {
      toast.error("No valid data to import. Please check your CSV file.");
      return;
    }

    const formattedData = validData.map((item) => ({
      ...item,
      amount: convertAmountToMiliunits(parseFloat(item.amount)),
      date: parse(item.date, dateFormat, new Date()),
      notes: item.notes || null,
    }));

    console.log(
      `Importing ${formattedData.length} transactions:`,
      formattedData,
    );
    onSubmit(formattedData);
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm bg-white">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between border-b pb-6">
          <div className="flex items-center gap-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
              <FileSpreadsheet className="size-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Import Transactions
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Map your CSV columns to import transactions
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 items-center">
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="w-full lg:w-auto border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
              className="w-full lg:w-auto bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-800 font-semibold mb-1">
                  How to map your data
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Select the corresponding field for each column in your CSV
                  file.
                  <span className="font-medium text-gray-800">
                    {" "}
                    Required: Date (yyyy-MM-dd), Payee, and Amount.
                  </span>{" "}
                  You can skip columns you don&apos;t need.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left w-12">
                      <Checkbox
                        checked={Object.values(selectedRows).every(
                          (selected) => selected,
                        )}
                        onCheckedChange={toggleAllRows}
                        aria-label="Select all rows"
                      />
                    </th>
                    {headers.map((_item, index) => (
                      <th key={index} className="px-4 py-4 text-left">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Column {index + 1}
                          </label>
                          <select
                            className="w-full min-w-[140px] px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-gray-300"
                            value={selectedColumns[`column_${index}`] || ""}
                            onChange={(e) =>
                              onTableHeadSelectChange(index, e.target.value)
                            }
                          >
                            <option value="" className="text-gray-400">
                              Select field...
                            </option>
                            <option value="date">📅 Date</option>
                            <option value="payee">👤 Payee</option>
                            <option value="amount">💰 Amount</option>
                            <option value="notes">📝 Notes</option>
                            <option value="skip">⊘ Skip</option>
                          </select>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {body.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        !selectedRows[rowIndex] ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 w-12">
                        <Checkbox
                          checked={selectedRows[rowIndex]}
                          onCheckedChange={() => toggleRowSelection(rowIndex)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-700 font-medium"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              Showing {body.length} row{body.length !== 1 ? "s" : ""} from your
              CSV file
            </span>
            <span className="font-medium text-blue-600">
              {selectedCount} of {body.length} row{body.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
