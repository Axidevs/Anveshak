import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { mockAuditLog } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import { Shield, Lock, AlertTriangle, Activity, X } from 'lucide-react';

export default function SecurityPanel() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const breadcrumbs = [
    { label: t('Home') || 'Home', path: '/' },
    { label: t('Security & Audit') || 'Security & Audit', path: '/officer/security' }
  ];

  const recentAudits = mockAuditLog.slice(0, 5);

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-forest" />
            </div>
            <h2 className="text-2xl font-bold text-forest mb-1">{t('Secure') || 'Secure'}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('System Status: Normal') || 'System Status: Normal'}</p>
            <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
              <Lock className="w-3 h-3 text-navy" />
              AES-256 Encryption Active
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">{t('Encryption Status') || 'Encryption Status'}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-navy" />
                  <span className="font-medium text-sm text-gray-700">Evidence Vault</span>
                </div>
                <span className="text-xs font-bold text-forest">ENCRYPTED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-navy" />
                  <span className="font-medium text-sm text-gray-700">Case Documents</span>
                </div>
                <span className="text-xs font-bold text-forest">ENCRYPTED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-navy" />
                  <span className="font-medium text-sm text-gray-700">Chat Messages</span>
                </div>
                <span className="text-xs font-bold text-forest">E2E ENCRYPTED</span>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-alert/10 text-alert font-semibold py-2 px-4 rounded-lg hover:bg-alert/20 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('Report Vulnerability') || 'Report Vulnerability'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-semibold text-charcoal">{t('Recent Audit Log') || 'Recent Audit Log'}</h2>
          </div>
          
          <div className="space-y-4">
            {recentAudits.map(audit => (
              <div key={audit.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-navy flex-shrink-0" />
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-charcoal">{audit.action}</span>
                    <span className="text-xs text-gray-500">{formatDate(audit.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Target: <span className="font-medium text-navy">{audit.target}</span></p>
                  <p className="text-xs text-gray-500">Performed by: {audit.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-alert flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Report Vulnerability
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-charcoal transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-alert focus:border-alert">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4} 
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-alert focus:border-alert"
                  placeholder="Describe the security concern..."
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-alert text-white font-medium py-2 rounded-lg hover:bg-alert/90 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
