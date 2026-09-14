import React, { useEffect, useState } from 'react';

import Breadcrumb from '../../components/layout/Breadcrumb';

import {
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Search,
  X,
  File
} from 'lucide-react';

import { apiFetch } from '../../utils/api';

const ViewDocuments = () => {
  const [expandedCase, setExpandedCase] = useState(null);

  const [previewDoc, setPreviewDoc] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);

  const toggleCase = (caseId) => {
    if (expandedCase === caseId) {
      setExpandedCase(null);
    } else {
      setExpandedCase(caseId);
    }
  };

  useEffect(() => {
    const loadCourtCases = async () => {
      try {
        setLoading(true);

        const response = await apiFetch('/case');

        const caseList = Array.isArray(response)
          ? response
          : response?.cases ||
            response?.data ||
            [];

        setCases(caseList);
      } catch (error) {
        console.error(
          'Failed to load court documents:',
          error
        );

        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourtCases();
  }, []);

  const getCaseId = (caseItem) => {
    return (
      caseItem?.caseId ||
      caseItem?.id ||
      caseItem?._id ||
      'N/A'
    );
  };

  const getCaseTitle = (caseItem) => {
    return (
      caseItem?.title ||
      caseItem?.caseTitle ||
      caseItem?.firNumber ||
      'Case Record'
    );
  };

  const getCaseSection = (caseItem) => {
    return (
      caseItem?.section ||
      caseItem?.legalSection ||
      caseItem?.category ||
      caseItem?.type ||
      'N/A'
    );
  };

  const getParties = (caseItem) => {
    if (caseItem?.parties) {
      return caseItem.parties;
    }

    if (caseItem?.complainant) {
      return caseItem.complainant;
    }

    return 'N/A';
  };

  const getDocuments = (caseItem) => {
    const documents =
      caseItem?.evidence ||
      caseItem?.documents ||
      caseItem?.caseDocuments ||
      [];

    return Array.isArray(documents)
      ? documents
      : [];
  };

  const getDocumentName = (doc) => {
    return (
      doc?.name ||
      doc?.filename ||
      doc?.fileName ||
      'Unnamed Document'
    );
  };

  const getDocumentType = (doc) => {
    return (
      doc?.type ||
      doc?.documentType ||
      doc?.category ||
      'Evidence'
    );
  };

  const getDocumentDate = (doc) => {
    const date =
      doc?.date ||
      doc?.createdAt ||
      doc?.uploadedAt;

    if (!date) {
      return 'Date unavailable';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDocumentSize = (doc) => {
    if (doc?.size) {
      return doc.size;
    }

    if (doc?.fileSize) {
      return `${(
        Number(doc.fileSize) /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return 'Size unavailable';
  };

  const filteredCases = cases.filter(
    (caseItem) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      if (!search) return true;

      const caseId = getCaseId(
        caseItem
      ).toLowerCase();

      const title = getCaseTitle(
        caseItem
      ).toLowerCase();

      return (
        title.includes(search) ||
        caseId.includes(search)
      );
    }
  );

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  const handleDownload = (doc) => {
    const fileUrl =
      doc?.fileUrl ||
      doc?.url;

    if (fileUrl) {
      window.open(
        fileUrl,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    const filePath =
      doc?.filePath ||
      doc?.path;

    if (filePath) {
      window.open(
        filePath,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    alert(
      'The document is securely stored, but a downloadable file URL is not available yet.'
    );
  };

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          {
            label: 'Court Dashboard',
            path: '/court'
          },
          {
            label: 'View Documents',
            path: '/court/documents'
          }
        ]}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">
            Document Repository
          </h1>

          <p className="text-charcoal/70">
            Read-only view of all case documents.
          </p>
        </div>

        <div className="relative w-full sm:w-64">

          <input
            type="text"
            placeholder="Search cases..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />

        </div>

      </div>

      <div className="space-y-4">

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-10 text-charcoal/60">
            Loading case documents...
          </div>
        ) : (
          filteredCases.map((courtCase) => {

            const caseId =
              getCaseId(courtCase);

            const documents =
              getDocuments(courtCase);

            return (
              <div
                key={caseId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
              >

                <div
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-cream"
                  onClick={() =>
                    toggleCase(caseId)
                  }
                >

                  <div>

                    <div className="flex items-center gap-3 mb-1">

                      <span className="font-bold text-navy">
                        {caseId}
                      </span>

                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Sec {getCaseSection(
                          courtCase
                        )}
                      </span>

                    </div>

                    <h3 className="text-lg font-semibold text-charcoal">
                      {getCaseTitle(
                        courtCase
                      )}
                    </h3>

                    <p className="text-sm text-charcoal/60 mt-1">
                      Parties:{' '}
                      {getParties(
                        courtCase
                      )}
                    </p>

                  </div>

                  <div className="text-navy bg-navy-50 p-2 rounded-full">

                    {expandedCase ===
                    caseId ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}

                  </div>

                </div>

                {expandedCase === caseId && (
                  <div className="p-5 bg-cream border-t border-gray-100">

                    <h4 className="font-semibold text-charcoal mb-3 flex items-center gap-2">

                      <FileText
                        size={16}
                        className="text-navy"
                      />

                      Filed Documents

                    </h4>

                    {documents.length > 0 ? (

                      <div className="space-y-2">

                        {documents.map(
                          (doc, idx) => {

                            const name =
                              getDocumentName(
                                doc
                              );

                            return (
                              <div
                                key={
                                  doc?.evidenceId ||
                                  doc?._id ||
                                  doc?.id ||
                                  idx
                                }
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-navy-300 transition-colors"
                              >

                                <div className="flex items-center gap-3">

                                  <div className="bg-red-50 text-alert p-2 rounded-lg">

                                    <File
                                      size={20}
                                    />

                                  </div>

                                  <div>

                                    <p className="font-medium text-charcoal text-sm">
                                      {name}
                                    </p>

                                    <p className="text-xs text-charcoal/50">

                                      {getDocumentSize(
                                        doc
                                      )}

                                      {' • Uploaded '}

                                      {getDocumentDate(
                                        doc
                                      )}

                                    </p>

                                  </div>

                                </div>

                                <div className="flex items-center gap-2 mt-3 sm:mt-0">

                                  <button
                                    onClick={() =>
                                      handlePreview(
                                        doc
                                      )
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-navy-50 text-navy hover:bg-navy hover:text-white rounded-md transition-colors font-medium"
                                  >
                                    <Eye size={14} />
                                    Preview
                                  </button>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    ) : (

                      <p className="text-sm text-charcoal/60 italic">
                        No documents filed for this case yet.
                      </p>

                    )}

                  </div>
                )}

              </div>
            );
          })
        )}

        {!loading &&
          filteredCases.length === 0 && (
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

                <FileText
                  size={20}
                  className="text-navy"
                />

                <h3 className="font-bold text-charcoal">
                  {getDocumentName(
                    previewDoc
                  )}
                </h3>

              </div>

              <button
                onClick={() =>
                  setPreviewDoc(null)
                }
                className="text-gray-400 hover:text-alert transition-colors p-1"
                aria-label="Close preview"
              >
                <X size={24} />
              </button>

            </div>

            <div className="flex-1 bg-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">

              <div className="w-full max-w-2xl bg-white h-full shadow-md rounded-sm border border-gray-300 p-8 flex flex-col relative">

                <div className="absolute top-4 right-4 text-xs text-gray-400">
                  PDF Preview
                </div>

                <div className="text-center mb-8 border-b pb-4">

                  <h2 className="text-xl font-bold text-charcoal mb-2">
                    Government of India
                  </h2>

                  <h3 className="text-lg font-semibold text-charcoal/80">
                    {getDocumentName(
                      previewDoc
                    ).replace(
                      /\.pdf$/i,
                      ''
                    )}
                  </h3>

                </div>

                <div className="space-y-4 text-sm text-charcoal/80 flex-1">

                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-11/12" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                  <div className="h-4 bg-gray-200 rounded w-full mt-8" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />

                </div>

                <div className="mt-auto border-t pt-4 text-center text-xs text-gray-500">
                  PDF Document
                </div>

              </div>

            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">

              <p className="text-sm text-charcoal/60">
                Secure document preview
              </p>

              <button
                onClick={() =>
                  handleDownload(
                    previewDoc
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition-colors font-medium"
              >
                <Download size={16} />
                Download Copy
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ViewDocuments;