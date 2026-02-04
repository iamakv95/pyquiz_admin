import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV, validateQuestionRow, downloadCSVTemplate, csvRowToQuestionData, type QuestionCSVRow } from '../../../utils/csv';
import { questionService } from '../../../services/content.service';

interface ValidationResult {
  row: QuestionCSVRow;
  index: number;
  errors: string[];
}

const BulkImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setValidationResults([]);
    setImportResults(null);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);

      // Validate all rows
      const results: ValidationResult[] = rows.map((row, index) => ({
        row,
        index,
        errors: validateQuestionRow(row, index),
      }));

      setValidationResults(results);
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse CSV file. Please check the format.');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    const validRows = validationResults.filter(r => r.errors.length === 0);
    
    if (validRows.length === 0) {
      alert('No valid rows to import');
      return;
    }

    if (!confirm(`Import ${validRows.length} questions? This cannot be undone.`)) {
      return;
    }

    setImporting(true);
    let successCount = 0;
    let failedCount = 0;

    for (const result of validRows) {
      try {
        const questionData = csvRowToQuestionData(result.row);
        await questionService.create(questionData);
        successCount++;
      } catch (error) {
        console.error(`Failed to import row ${result.index + 1}:`, error);
        failedCount++;
      }
    }

    setImporting(false);
    setImportResults({ success: successCount, failed: failedCount });
  };

  const validCount = validationResults.filter(r => r.errors.length === 0).length;
  const invalidCount = validationResults.filter(r => r.errors.length > 0).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/content/questions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Questions
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Import Questions</h1>
            <p className="text-gray-600 mt-1">Import multiple questions from a CSV file</p>
          </div>
          <button
            onClick={downloadCSVTemplate}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={20} />
            Download Template
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Download the CSV template using the button above</li>
          <li>Fill in your questions following the template format</li>
          <li>Ensure all required fields are filled (marked with *)</li>
          <li>Upload the completed CSV file below</li>
          <li>Review validation results and fix any errors</li>
          <li>Click "Import Questions" to complete the import</li>
        </ol>
      </div>

      {/* File Upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <label className="cursor-pointer">
            <span className="text-blue-600 font-medium hover:text-blue-700">
              Click to upload
            </span>
            <span className="text-gray-600"> or drag and drop</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">CSV files only</p>
          {file && (
            <p className="text-sm text-gray-700 mt-4 font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>
      </div>

      {/* Parsing Status */}
      {parsing && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Parsing CSV file...</p>
        </div>
      )}

      {/* Validation Results */}
      {validationResults.length > 0 && !parsing && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h2>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Rows</p>
              <p className="text-2xl font-bold text-gray-900">{validationResults.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Valid</p>
              <p className="text-2xl font-bold text-green-900">{validCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Invalid</p>
              <p className="text-2xl font-bold text-red-900">{invalidCount}</p>
            </div>
          </div>

          {/* Errors List */}
          {invalidCount > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle size={20} />
                Errors Found
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {validationResults
                  .filter(r => r.errors.length > 0)
                  .map((result, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="font-medium text-red-900 mb-1">
                        Row {result.index + 1}
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {result.errors.map((error, errorIdx) => (
                          <li key={errorIdx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Import Button */}
          {validCount > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload size={20} />
                {importing ? 'Importing...' : `Import ${validCount} Questions`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Import Complete
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Successfully Imported</p>
              <p className="text-2xl font-bold text-green-900">{importResults.success}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-900">{importResults.failed}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/content/questions')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Questions
            </button>
            <button
              onClick={() => {
                setFile(null);
                setValidationResults([]);
                setImportResults(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
