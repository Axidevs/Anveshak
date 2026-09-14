import React, { useState } from 'react';
import { mockCourtCases } from '../../data/mockData';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { FileText, ChevronDown, ChevronUp, Eye, Download, Search, X, File } from 'lucide-react';

const ViewDocuments = () => {
  const [expandedCase, setExpandedCase] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCase = (caseId) => {
    if (expandedCase === caseId) setExpandedCase(null);
    else setExpandedCase(caseId);
  };

  const filteredCases = mockCourtCases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Court Dashboard', path: '/court' },
        { label: 'View Documents', path: '/court/documents' }
      ]} />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Document Repository</h1>
          <p className="text-charcoal/70">Read-only view of all case documents.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search cases..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCases.map(courtCase => (
          <div key={courtCase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div 
              className="p-5 flex justify-between items-center cursor-pointer hover:bg-cream"
              onClick={() => toggleCase(courtCase.id)}
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-navy">{courtCase.id}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Sec {courtCase.section}</span>
                </div>
                <h3 className="text-lg font-semibold text-charcoal">{courtCase.title}</h3>
                <p className="text-sm text-charcoal/60 mt-1">Parties: {courtCase.parties || 'N/A'}</p>
              </div>
              <div className="text-navy bg-navy-50 p-2 rounded-full">
                {expandedCase === courtCase.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedCase === courtCase.id && (
              <div className="p-5 bg-cream border-t border-gray-100">
                <h4 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-navy" /> Filed Documents
                </h4>
                
                {courtCase.documents && courtCase.documents.length > 0 ? (
                  <div className="space-y-2">
                    {courtCase.documents.map((doc, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-navy-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-50 text-alert p-2 rounded-lg">
                            <File size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal text-sm">{doc.name}</p>
                            <p className="text-xs text-charcoal/50">{doc.size || '1.2 MB'} • Uploaded {doc.date || 'Sept 1, 2026'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 sm:mt-0">
                          <button 
                            onClick={() => setPreviewDoc(doc)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-navy-50 text-navy hover:bg-navy hover:text-white rounded-md transition-colors font-medium"
                          >
                            <Eye size={14} /> Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal/60 italic">No documents filed for this case yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredCases.length === 0 && (
          <div className="text-center py-10 text-charcoal/60">
            No cases match your search.
          </div>
        )}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-navy" />
                <h3 className="font-bold text-charcoal">{previewDoc.name}</h3>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-alert transition-colors p-1"
                aria-label="Close preview"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full max-w-2xl bg-white h-full shadow-md rounded-sm border border-gray-300 p-8 flex flex-col relative">
                <div className="absolute top-4 right-4 text-xs text-gray-400">PDF Preview</div>
                <div className="text-center mb-8 border-b pb-4">
                  <h2 className="text-xl font-bold text-charcoal mb-2">Government of India</h2>
                  <h3 className="text-lg font-semibold text-charcoal/80">{previewDoc.name.replace('.pdf', '')}</h3>
                </div>
                <div className="space-y-4 text-sm text-charcoal/80 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-8"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="mt-auto border-t pt-4 text-center text-xs text-gray-500">
                  Page 1 of 5
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
              <p className="text-sm text-charcoal/60">Simulated PDF Viewer Component</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition-colors font-medium">
                <Download size={16} /> Download Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;
