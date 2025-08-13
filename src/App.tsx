import React, { useState } from 'react';
import { Send, FileText, CheckCircle, AlertCircle, Loader, Download, Building2, Calendar, Package, Hash, Plus, Sparkles, Shield, Zap, Clock } from 'lucide-react';
import logo from './assets/logo.png';

interface FormData {
  companyName: string;
  customCompanyName: string; // ⬅ new field
  billNumber: string;
  billType: string;
  billDate: string;
  consignmentNumber: string;
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

const PREDEFINED_COMPANIES = [
  'ABC Pvt Ltd',
  'XYZ Industries',
  'Add New'
];


function App() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    customCompanyName: '',
    billNumber: '',
    billType: '',
    billDate: '',
    consignmentNumber: '',
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

    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName === 'Add New' && !formData.customCompanyName.trim()) {
      newErrors.customCompanyName = 'Custom company name is required';
    }
    if (!formData.billNumber.trim()) newErrors.billNumber = 'Bill number is required';
    if (!formData.billType.trim()) newErrors.billType = 'Bill type is required';
    if (!formData.billDate) newErrors.billDate = 'Bill date is required';
    if (!formData.consignmentNumber.trim()) newErrors.consignmentNumber = 'Consignment number is required';
    
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
    
    if (name === 'itemDescription' && value !== 'Add New') {
      setFormData(prev => ({ ...prev, customItemDescription: '' }));
    }

    if (name === 'companyName' && value !== 'Add New') {
      setFormData(prev => ({ ...prev, customCompanyName: '' }));
    }
    
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
      const submissionData = {
        ...formData,
        companyName:
          formData.companyName === 'Add New'
            ? formData.customCompanyName
            : formData.companyName,
        itemDescription:
          formData.itemDescription === 'Add New'
            ? formData.customItemDescription
            : formData.itemDescription
      };

      const response = await fetch(
        'https://shubamsarawagi.app.n8n.cloud/webhook/d05cad85-bc6b-4f41-ba84-b2275884ffa7',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        }
      );

      if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = 'tax-invoice.xlsx';

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        } else {
          const billNumber = formData.billNumber.replace(/[^a-zA-Z0-9]/g, '-');
          const companyName = (formData.companyName === 'Add New'
            ? formData.customCompanyName
            : formData.companyName
          )
            .replace(/[^a-zA-Z0-9]/g, '-')
            .substring(0, 20);
          fileName = `${companyName}-${billNumber}-invoice.xlsx`;
        }

        const blob = await response.blob();
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

        setFormData({
          companyName: '',
          customCompanyName: '',
          billNumber: '',
          billType: '',
          billDate: '',
          consignmentNumber: '',
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
        errorMessage:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl">
                  <img src={logo} alt="Company Logo" className="h-16 w-16 object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  METALCO
                </h1>
                <p className="text-blue-100 font-medium text-lg">Professional Invoice Generator</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-white font-medium">System Online</span>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Smart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-10 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Invoice Generation Portal</h2>
                  <p className="text-slate-300">Create professional tax invoices with intelligent automation</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <div className="flex items-center space-x-2 text-white">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Instant Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10">
            <div className="space-y-10">
              {/* Company Information Section */}
              <div className="group">
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Company Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                  </div>

                  {/* Company Name Dropdown */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-bold text-slate-700 mb-3">
                      Company Name
                    </label>
                    <div className="relative group">
                      <select
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${
                          errors.companyName
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                        } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                      >
                        <option value="">Select company name</option>
                        {PREDEFINED_COMPANIES.map((company) => (
                          <option key={company} value={company}>
                            {company === 'Add New' ? '+ Add New Company' : company}
                          </option>
                        ))}
                      </select>
                      <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    {errors.companyName && (
                      <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Step 7: Custom Company Name Input */}
                  {formData.companyName === 'Add New' && (
                    <div className="mt-4">
                      <label htmlFor="customCompanyName" className="block text-sm font-bold text-slate-700 mb-3">
                        Custom Company Name
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          id="customCompanyName"
                          name="customCompanyName"
                          value={formData.customCompanyName}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${
                            errors.customCompanyName
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                          } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                          placeholder="Enter custom company name"
                        />
                        <Plus className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                      </div>
                      {errors.customCompanyName && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.customCompanyName}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>


              {/* Invoice Details Section */}
              <div className="group">
                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg">
                      <Hash className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Invoice Details</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bill Number */}
                    <div>
                      <label htmlFor="billNumber" className="block text-sm font-bold text-slate-700 mb-3">
                        Bill Number
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          id="billNumber"
                          name="billNumber"
                          value={formData.billNumber}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${errors.billNumber 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                          } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                          placeholder="2025-26/001"
                        />
                        <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      {errors.billNumber && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.billNumber}
                        </p>
                      )}
                    </div>

                    {/* Consignment Number */}
                    <div>
                      <label htmlFor="consignmentNumber" className="block text-sm font-bold text-slate-700 mb-3">
                        Consignment Number
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          id="consignmentNumber"
                          name="consignmentNumber"
                          value={formData.consignmentNumber}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${errors.consignmentNumber 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                          } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                          placeholder="CON-2025-001"
                        />
                        <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      {errors.consignmentNumber && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.consignmentNumber}
                        </p>
                      )}
                    </div>

                    {/* Bill Type */}
                    <div>
                      <label htmlFor="billType" className="block text-sm font-bold text-slate-700 mb-3">
                        Bill Type
                      </label>
                      <select
                        id="billType"
                        name="billType"
                        value={formData.billType}
                        onChange={handleInputChange}
                        className={`w-full px-6 py-4 rounded-xl border-2 ${errors.billType 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                        } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                      >
                        <option value="">Select bill type</option>
                        <option value="DUPLICATE - SELLER'S COPY">DUPLICATE - SELLER'S COPY</option>
                        <option value="BUYER'S COPY">BUYER'S COPY</option>
                        <option value="TRANSPORTER'S COPY">TRANSPORTER'S COPY</option>
                        <option value="BUYER'S EXTRA COPY">BUYER'S EXTRA COPY</option>
                      </select>
                      {errors.billType && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.billType}
                        </p>
                      )}
                    </div>

                    {/* Bill Date */}
                    <div>
                      <label htmlFor="billDate" className="block text-sm font-bold text-slate-700 mb-3">
                        Bill Date
                      </label>
                      <div className="relative group">
                        <input
                          type="date"
                          id="billDate"
                          name="billDate"
                          value={formData.billDate}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${errors.billDate 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                          } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                        />
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      {errors.billDate && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.billDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information Section */}
              <div className="group">
                <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Product Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Item Description */}
                    <div className="lg:col-span-2">
                      <label htmlFor="itemDescription" className="block text-sm font-bold text-slate-700 mb-3">
                        Item Description
                      </label>
                      <div className="relative group">
                        <select
                          id="itemDescription"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${errors.itemDescription 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                          } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                        >
                          <option value="">Select item description</option>
                          {PREDEFINED_ITEMS.map((item) => (
                            <option key={item} value={item}>
                              {item === 'Add New' ? '+ Add New Item' : item}
                            </option>
                          ))}
                        </select>
                        <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      </div>
                      {errors.itemDescription && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.itemDescription}
                        </p>
                      )}
                    </div>

                    {/* Custom Item Description */}
                    {formData.itemDescription === 'Add New' && (
                      <div className="lg:col-span-2">
                        <label htmlFor="customItemDescription" className="block text-sm font-bold text-slate-700 mb-3">
                          Custom Item Description
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            id="customItemDescription"
                            name="customItemDescription"
                            value={formData.customItemDescription}
                            onChange={handleInputChange}
                            className={`w-full px-6 py-4 pl-14 rounded-xl border-2 ${errors.customItemDescription 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                            } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                            placeholder="Enter custom item description"
                          />
                          <Plus className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                        </div>
                        {errors.customItemDescription && (
                          <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {errors.customItemDescription}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 mb-3">
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
                        className={`w-full px-6 py-4 rounded-xl border-2 ${errors.quantity 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                        } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                        placeholder="Enter quantity"
                      />
                      {errors.quantity && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.quantity}
                        </p>
                      )}
                    </div>

                    {/* Bundles */}
                    <div>
                      <label htmlFor="bundles" className="block text-sm font-bold text-slate-700 mb-3">
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
                        className={`w-full px-6 py-4 rounded-xl border-2 ${errors.bundles 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                        } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                        placeholder="Enter bundles"
                      />
                      {errors.bundles && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.bundles}
                        </p>
                      )}
                    </div>

                    {/* Rate */}
                    <div className="lg:col-span-2">
                      <label htmlFor="rate" className="block text-sm font-bold text-slate-700 mb-3">
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
                        className={`w-full px-6 py-4 rounded-xl border-2 ${errors.rate 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                        } focus:outline-none focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md font-medium`}
                        placeholder="Enter rate per unit"
                      />
                      {errors.rate && (
                        <p className="text-red-600 text-sm mt-3 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.rate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-12 flex justify-center">
              <button
                type="submit"
                disabled={submissionState.isLoading}
                className="relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-5 px-12 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 disabled:transform-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {submissionState.isLoading ? (
                  <>
                    <Loader className="h-7 w-7 animate-spin relative z-10" />
                    <span className="text-xl relative z-10">Generating Invoice...</span>
                  </>
                ) : (
                  <>
                    <div className="relative z-10 bg-white/20 p-2 rounded-lg">
                      <Send className="h-7 w-7" />
                    </div>
                    <span className="text-xl relative z-10">Generate & Download Invoice</span>
                    <Sparkles className="h-6 w-6 relative z-10 opacity-75 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Response Display */}
        {(submissionState.isSuccess || submissionState.isError) && (
          <div className="mt-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <div className={`px-10 py-8 border-b relative overflow-hidden ${
              submissionState.isSuccess 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-300' 
                : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-300'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    {submissionState.isSuccess ? (
                      <CheckCircle className="h-8 w-8 text-white" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {submissionState.isSuccess ? 'Invoice Generated Successfully!' : 'Generation Failed'}
                  </h3>
                </div>
                <button
                  onClick={resetSubmissionState}
                  className="text-white/70 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-10">
              {submissionState.isSuccess ? (
                <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 border border-green-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                      <Download className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-green-800 font-bold text-xl mb-2">Invoice downloaded successfully!</p>
                      <p className="text-green-700 font-semibold text-lg">File: {submissionState.fileName}</p>
                      <p className="text-green-600 mt-2">The invoice has been automatically downloaded to your device and is ready for use.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-8 border border-red-200/50">
                  <div className="flex items-center space-x-6">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                      <AlertCircle className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-red-800 font-bold text-xl mb-2">Error occurred during generation</p>
                      <p className="text-red-700 text-lg">{submissionState.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16 mt-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-xl">
                  <img src={logo} alt="Company Logo" className="h-10 w-10 object-contain" />
                </div>
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">METALCO</h3>
            </div>
            <p className="text-xl font-semibold mb-4 text-blue-100">&copy; 2025 METALCO. Professional Tax Invoice Generator.</p>
            <p className="text-slate-300 mb-8">Powered by advanced workflow automation technology</p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                <span className="font-medium">Secure Processing</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                <span className="font-medium">Instant Download</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                <span className="font-medium">Professional Format</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;