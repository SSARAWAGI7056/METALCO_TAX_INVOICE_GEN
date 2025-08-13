import React, { useState } from 'react';
import { Send, FileText, CheckCircle, AlertCircle, Loader, Download, Building2, Calendar, Package, Hash, Plus } from 'lucide-react';

interface FormData {
  companyName: string;
  billNumber: string;
  billType: string;
  billDate: string;
  itemDescription: string;
  customItemDescription: string;
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

const PREDEFINED_ITEMS = [
  'PAPER SACKS',
  'PP',
  'Add New'
];

function App() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    billNumber: '',
    billType: '',
    billDate: '',
    itemDescription: '',
    customItemDescription: '',
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
    
    // Validate item description
    if (!formData.itemDescription) {
      newErrors.itemDescription = 'Item description is required';
    } else if (formData.itemDescription === 'Add New' && !formData.customItemDescription.trim()) {
      newErrors.customItemDescription = 'Custom item description is required';
    }
    
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
    
    // Clear custom item description when switching away from "Add New"
    if (name === 'itemDescription' && value !== 'Add New') {
      setFormData(prev => ({ ...prev, customItemDescription: '' }));
    }
    
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
      // Prepare submission data with the correct item description
      const submissionData = {
        ...formData,
        itemDescription: formData.itemDescription === 'Add New' 
          ? formData.customItemDescription 
          : formData.itemDescription
      };

      const response = await fetch('https://shubamsarawagi.app.n8n.cloud/webhook/d05cad85-bc6b-4f41-ba84-b2275884ffa7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
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
          customItemDescription: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  METALCO
                </h1>
                <p className="text-slate-600 font-medium">Professional Tax Invoice Generator</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-600">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">Invoice Generation Portal</h2>
                <p className="text-slate-300 text-sm">Complete the form below to generate your professional tax invoice</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Company Information Section */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-3">
                        Company Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 pl-12 rounded-xl border-2 ${errors.companyName 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                          } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                          placeholder="Enter company name"
                        />
                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Details Section */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Hash className="h-5 w-5 mr-2 text-emerald-600" />
                    Invoice Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bill Number */}
                    <div>
                      <label htmlFor="billNumber" className="block text-sm font-semibold text-slate-700 mb-3">
                        Bill Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="billNumber"
                          name="billNumber"
                          value={formData.billNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 pl-12 rounded-xl border-2 ${errors.billNumber 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                          } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                          placeholder="2025-26/001"
                        />
                        <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      {errors.billNumber && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.billNumber}
                        </p>
                      )}
                    </div>

                    {/* Bill Type */}
                    <div>
                      <label htmlFor="billType" className="block text-sm font-semibold text-slate-700 mb-3">
                        Bill Type
                      </label>
                      <select
                        id="billType"
                        name="billType"
                        value={formData.billType}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 rounded-xl border-2 ${errors.billType 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                        } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                      >
                        <option value="">Select bill type</option>
                        <option value="DUPLICATE - SELLER'S COPY">DUPLICATE - SELLER'S COPY</option>
                        <option value="BUYER'S COPY">BUYER'S COPY</option>
                        <option value="TRANSPORTER'S COPY">TRANSPORTER'S COPY</option>
                        <option value="BUYER'S EXTRA COPY">BUYER'S EXTRA COPY</option>
                      </select>
                      {errors.billType && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.billType}
                        </p>
                      )}
                    </div>

                    {/* Bill Date */}
                    <div>
                      <label htmlFor="billDate" className="block text-sm font-semibold text-slate-700 mb-3">
                        Bill Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="billDate"
                          name="billDate"
                          value={formData.billDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 pl-12 rounded-xl border-2 ${errors.billDate 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                          } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                        />
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      {errors.billDate && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.billDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information Section */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Item Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="itemDescription" className="block text-sm font-semibold text-slate-700 mb-3">
                        Item Description
                      </label>
                      <div className="relative">
                        <select
                          id="itemDescription"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 pl-12 rounded-xl border-2 ${errors.itemDescription 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                          } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                        >
                          <option value="">Select item description</option>
                          {PREDEFINED_ITEMS.map((item) => (
                            <option key={item} value={item}>
                              {item === 'Add New' ? '+ Add New Item' : item}
                            </option>
                          ))}
                        </select>
                        <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      {errors.itemDescription && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.itemDescription}
                        </p>
                      )}
                    </div>

                    {/* Custom Item Description (shown when "Add New" is selected) */}
                    {formData.itemDescription === 'Add New' && (
                      <div className="md:col-span-2">
                        <label htmlFor="customItemDescription" className="block text-sm font-semibold text-slate-700 mb-3">
                          Custom Item Description
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="customItemDescription"
                            name="customItemDescription"
                            value={formData.customItemDescription}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 pl-12 rounded-xl border-2 ${errors.customItemDescription 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                            } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                            placeholder="Enter custom item description"
                          />
                          <Plus className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                        {errors.customItemDescription && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.customItemDescription}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-semibold text-slate-700 mb-3">
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
                        className={`w-full px-4 py-4 rounded-xl border-2 ${errors.quantity 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                        } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                        placeholder="0"
                      />
                      {errors.quantity && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.quantity}
                        </p>
                      )}
                    </div>

                    {/* Bundles */}
                    <div>
                      <label htmlFor="bundles" className="block text-sm font-semibold text-slate-700 mb-3">
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
                        className={`w-full px-4 py-4 rounded-xl border-2 ${errors.bundles 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                        } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                        placeholder="0"
                      />
                      {errors.bundles && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.bundles}
                        </p>
                      )}
                    </div>

                    {/* Rate */}
                    <div className="md:col-span-2">
                      <label htmlFor="rate" className="block text-sm font-semibold text-slate-700 mb-3">
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
                        className={`w-full px-4 py-4 rounded-xl border-2 ${errors.rate 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                        } focus:outline-none focus:ring-4 transition-all duration-200 bg-white shadow-sm`}
                        placeholder="0.00"
                      />
                      {errors.rate && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.rate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={submissionState.isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-blue-400 disabled:to-indigo-500 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none"
              >
                {submissionState.isLoading ? (
                  <>
                    <Loader className="h-6 w-6 animate-spin" />
                    <span className="text-lg">Generating Invoice...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6" />
                    <span className="text-lg">Generate & Download Invoice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Response Display */}
        {(submissionState.isSuccess || submissionState.isError) && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className={`px-8 py-6 border-b ${
              submissionState.isSuccess 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {submissionState.isSuccess ? (
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                  <h3 className={`text-xl font-bold ${
                    submissionState.isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {submissionState.isSuccess ? 'Invoice Generated Successfully!' : 'Generation Failed'}
                  </h3>
                </div>
                <button
                  onClick={resetSubmissionState}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white/50 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8">
              {submissionState.isSuccess ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Download className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800 font-bold text-lg">Invoice downloaded successfully!</p>
                      <p className="text-green-700 font-medium">File: {submissionState.fileName}</p>
                      <p className="text-green-600 text-sm mt-1">The invoice has been automatically downloaded to your device and is ready for use.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-bold text-lg">Error occurred during generation</p>
                      <p className="text-red-700">{submissionState.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-slate-300 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">METALCO</h3>
            </div>
            <p className="text-lg font-medium mb-2">&copy; 2025 METALCO. Professional Tax Invoice Generator.</p>
            <p className="text-slate-400">Powered by advanced workflow automation technology</p>
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Processing</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Instant Download</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Professional Format</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;