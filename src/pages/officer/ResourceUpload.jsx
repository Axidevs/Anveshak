import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { FileText, BarChart, Shield, UploadCloud, Lock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function ResourceUpload() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Documents');
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'FIR_Copy_1198.pdf', size: '2.4 MB', date: new Date().toISOString(), type: 'Documents' },
    { id: 2, name: 'Forensic_Report_A.pdf', size: '5.1 MB', date: new Date().toISOString(), type: 'Reports' },
    { id: 3, name: 'CCTV_Footage_Extract.mp4', size: '15.8 MB', date: new Date().toISOString(), type: 'Evidence' },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const breadcrumbs = [
    { label: t('Home') || 'Home', path: '/' },
    { label: t('Resource Upload') || 'Resource Upload', path: '/officer/upload' }
  ];

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newFile = {
        id: Date.now(),
        name: `New_Upload_${activeTab}_${Date.now()}.pdf`,
        size: '1.2 MB',
        date: new Date().toISOString(),
        type: activeTab
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
      setIsUploading(false);
    }, 1000);
  };

  const currentFiles = uploadedFiles.filter(f => f.type === activeTab);

  const getIcon = (type) => {
    if (type === 'Documents') return <FileText className="w-6 h-6 text-blue-500" />;
    if (type === 'Reports') return <BarChart className="w-6 h-6 text-purple-500" />;
    if (type === 'Evidence') return <Shield className="w-6 h-6 text-alert" />;
    return <FileText className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {['Documents', 'Reports', 'Evidence'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-50 text-navy border-b-2 border-navy'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(tab) || tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div 
            onClick={handleUpload}
            className="dropzone w-full p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-navy transition-all cursor-pointer flex flex-col items-center justify-center text-center"
          >
            {isUploading ? (
              <div className="animate-pulse flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-navy mb-4 animate-bounce" />
                <p className="text-charcoal font-medium">{t('Encrypting and Uploading...') || 'Encrypting and Uploading...'}</p>
              </div>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-charcoal font-medium text-lg mb-1">{t('Drag and drop files here') || 'Drag and drop files here'}</p>
                <p className="text-gray-500 text-sm mb-4">{t('or click to browse') || 'or click to browse'}</p>
                <div className="flex items-center gap-2 text-xs text-forest bg-forest/10 px-3 py-1.5 rounded-full font-medium">
                  <Lock className="w-3 h-3" />
                  {t('AES-256 End-to-End Encryption Enabled') || 'AES-256 End-to-End Encryption Enabled'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">{t('Recently Uploaded') || 'Recently Uploaded'}</h3>
        <div className="space-y-3">
          {currentFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getIcon(file.type)}
                </div>
                <div>
                  <p className="font-medium text-charcoal">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size} • {formatDate(file.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-medium text-forest bg-forest/10 px-2 py-1 rounded">
                  <Lock className="w-3 h-3" /> Encrypted
                </span>
                <CheckCircle2 className="w-5 h-5 text-forest" />
              </div>
            </div>
          ))}
          {currentFiles.length === 0 && (
            <p className="text-gray-500 text-center py-4">{t('No files uploaded in this category yet.') || 'No files uploaded in this category yet.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
