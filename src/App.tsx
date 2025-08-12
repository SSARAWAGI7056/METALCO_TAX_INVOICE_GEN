import React, { useState } from 'react';
import { Send, FileText, CheckCircle, AlertCircle, Loader, Download } from 'lucide-react';

interface FormData {
  companyName: string;
  billNumber: string;
  billType: string;
  billDate: string;
  itemDescription: string;
  quantity: string;
  bundles: string;
  rate: string;
}

interface SubmissionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  fileName: string;
  errorMessage: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    billNumber: '',
    billType: '',
    billDate: '',
    itemDescription: '',
    quantity: '',
    bundles: '',
    rate: ''
  });

  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    fileName: '',
    errorMessage: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.billNumber.trim()) newErrors.billNumber = 'Bill number is required';
    if (!formData.billType.trim()) newErrors.billType = 'Bill type is required';
    if (!formData.billDate) newErrors.billDate = 'Bill date is required';
    if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Item description is required';
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.bundles || isNaN(Number(formData.bundles)) || Number(formData.bundles) <= 0) {
      newErrors.bundles = 'Valid number of bundles is required';
    }
    if (!formData.rate || isNaN(Number(formData.rate)) || Number(formData.rate) <= 0) {
      newErrors.rate = 'Valid rate is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmissionState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      fileName: '',
      errorMessage: ''
    });

    try {
      const response = await fetch('https://shubamsarawagi.app.n8n.cloud/webhook/d05cad85-bc6b-4f41-ba84-b2275884ffa7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });


      if (response.ok) {
        // Get the filename from response headers or create a default one
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = 'tax-invoice.xlsx';
        
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        } else {
          // Create filename based on form data
          const billNumber = formData.billNumber.replace(/[^a-zA-Z0-9]/g, '-');
          const companyName = formData.companyName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
          fileName = `${companyName}-${billNumber}-invoice.xlsx`;
        }

        // Get the file blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSubmissionState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          fileName: fileName,
          errorMessage: ''
        });
        
        // Reset form after successful submission
        setFormData({
          companyName: '',
          billNumber: '',
          billType: '',
          billDate: '',
          itemDescription: '',
          quantity: '',
          bundles: '',
          rate: ''
        });
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      setSubmissionState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        fileName: '',
        errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const resetSubmissionState = () => {
    setSubmissionState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      fileName: '',
      errorMessage: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">METALCO</h1>
              <p className="text-slate-600">Automated Tax Invoice Generator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Generate Tax Invoice</h2>
            <p className="text-slate-600 text-sm mt-1">Fill in the details below to generate and email your tax invoice</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="md:col-span-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.companyName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Bill Type */}
              <div>
                <label htmlFor="billNumber" className="block text-sm font-medium text-slate-700 mb-2">
                  Bill Number
                </label>
                <input
                  type="text"
                  id="billNumber"
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.billNumber 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="2025-26/001"
                />
                {errors.billNumber && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.billNumber}
                  </p>
                )}
              </div>

              {/* Bill Type */}
              <div>
                <label htmlFor="billType" className="block text-sm font-medium text-slate-700 mb-2">
                  Bill Type
                </label>
                <select
                  id="billType"
                  name="billType"
                  value={formData.billType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.billType 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors bg-white`}
                >
                  <option value="">Select bill type</option>
                  <option value="DUPLICATE - SELLERS COPY">DUPLICATE - SELLERS COPY</option>
                  <option value="BUYERS COPY">BUYERS COPY</option>
                  <option value="Quote">Quote</option>
                  <option value="Receipt">Receipt</option>
                </select>
                {errors.billType && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.billType}
                  </p>
                )}
              </div> 

              {/* Bill Date */}
              <div>
                <label htmlFor="billDate" className="block text-sm font-medium text-slate-700 mb-2">
                  Bill Date
                </label>
                <input
                  type="date"
                  id="billDate"
                  name="billDate"
                  value={formData.billDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.billDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                />
                {errors.billDate && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.billDate}
                  </p>
                )}
              </div>

              {/* Item Description */}
              <div className="md:col-span-2">
                <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-700 mb-2">
                  Item Description
                </label>
                <input
                  type="text"
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.itemDescription 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="Enter item description"
                />
                {errors.itemDescription && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.itemDescription}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.quantity 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Bundles */}
              <div>
                <label htmlFor="bundles" className="block text-sm font-medium text-slate-700 mb-2">
                  Bundles
                </label>
                <input
                  type="number"
                  id="bundles"
                  name="bundles"
                  value={formData.bundles}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.bundles 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="0"
                />
                {errors.bundles && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.bundles}
                  </p>
                )}
              </div>

              {/* Rate */}
              <div className="md:col-span-2">
                <label htmlFor="rate" className="block text-sm font-medium text-slate-700 mb-2">
                  Rate (per unit)
                </label>
                <input
                  type="number"
                  id="rate"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.rate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="0.00"
                />
                {errors.rate && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.rate}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={submissionState.isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                {submissionState.isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating Invoice...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Generate & Send Invoice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Response Display */}
        {(submissionState.isSuccess || submissionState.isError) && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className={`px-6 py-4 border-b ${
              submissionState.isSuccess 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {submissionState.isSuccess ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h3 className={`font-semibold ${
                    submissionState.isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {submissionState.isSuccess ? 'Invoice Generated Successfully!' : 'Error Occurred'}
                  </h3>
                </div>
                <button
                  onClick={resetSubmissionState}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {submissionState.isSuccess ? (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Download className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-green-800 font-semibold">Invoice downloaded successfully!</p>
                      <p className="text-green-700 text-sm">File: {submissionState.fileName}</p>
                      <p className="text-green-600 text-xs mt-1">The invoice has been automatically downloaded to your device.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-red-700">{submissionState.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2025 METALCO. Automated Tax Invoice Generator.</p>
          <p className="text-sm text-slate-400 mt-1">Powered by advanced workflow automation</p>
        </div>
      </footer>
    </div>
  );
}

export default App;