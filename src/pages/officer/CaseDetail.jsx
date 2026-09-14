import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockOfficerCases, mockAuditLog } from '../../data/mockData';
import CaseTimeline from '../../components/shared/CaseTimeline';
import FormalCaseChat from '../../components/shared/FormalCaseChat';
import SignatureVerification from '../../components/shared/SignatureVerification';
import { 
  ArrowLeft, Download, Shield, Clock, MapPin, Users, 
  FileText, Upload, AlertTriangle, CheckCircle, Link as LinkIcon, 
  User, Activity, FileCheck, Search, Share2, Briefcase, Plus, Send, X
} from 'lucide-react';
import AuditTrail from '../../components/shared/AuditTrail';

const defaultTimeline = [
  { date: 'As filed', event: 'FIR Filed', description: 'First Information Report registered at station.', by: 'Station IO' },
  { date: 'Under investigation', event: 'Assigned to IO', description: 'Case assigned to investigating officer.', by: 'SHO' },
  { date: 'Ongoing', event: 'Investigation Ongoing', description: 'Field investigation and evidence collection in progress.', by: 'IO Team' },
];

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showUploadEvidence, setShowUploadEvidence] = useState(false);
  const [signatureVerified, setSignatureVerified] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);

  const [showEditTimeline, setShowEditTimeline] = useState(false);
  const [timelineSignatureVerified, setTimelineSignatureVerified] = useState(false);
  const [timelineEvent, setTimelineEvent] = useState({ date: '', event: '', description: '' });

  const [showAuditModal, setShowAuditModal] = useState(false);

  // Find the case
  const caseData = mockOfficerCases?.find(c => c.id === id || c.caseId === id) || {
    id: id,
    caseId: id || 'CAS-000',
    title: 'Unknown Case',
    status: 'Unknown',
    priority: 'Normal',
    type: 'N/A',
    date: 'N/A',
    location: 'N/A',
    description: 'Case details not found.',
  };

  const statusMap = {
    'active': 2,
    'Active': 2,
    'court': 5,
    'Court': 5,
    'resolved': 8,
    'Resolved': 8,
  };
  
  const statusStep = statusMap[caseData.status] || 1;

  // Mock Evidence data if not present
  const evidenceList = caseData.evidence || [
    { id: 1, filename: 'witness_statement_1.pdf', type: 'Document', uploadedBy: 'Officer Sharma', date: '2026-09-01' },
    { id: 2, filename: 'cctv_footage_cam4.mp4', type: 'Video', uploadedBy: 'Inspector Patil', date: '2026-09-02' },
    { id: 3, filename: 'forensic_report_initial.pdf', type: 'Report', uploadedBy: 'Dr. Gupta (FSL)', date: '2026-09-04' }
  ];

  // Case Audit Log
  const caseAuditLog = mockAuditLog?.filter(log => log.caseId === id) || [
    { id: 101, action: 'Viewed Case File', by: 'Insp. R. Sharma', timestamp: '2 mins ago', verified: true },
    { id: 102, action: 'Evidence Uploaded', by: 'Sub-Insp. A. Patel', timestamp: '1 hour ago', verified: true },
    { id: 103, action: 'Status Updated to Active', by: 'SHO K. Singh', timestamp: '1 day ago', verified: true }
  ];

  const handleEvidenceUpload = (e) => {
    e.preventDefault();
    if (!evidenceFile) return;
    alert(`File ${evidenceFile.name} securely uploaded and signed.`);
    setEvidenceFile(null);
    setShowUploadEvidence(false);
    setSignatureVerified(false);
  };

  const handleTimelineUpdate = (e) => {
    e.preventDefault();
    if (!timelineEvent.event) return;
    alert(`Timeline event "${timelineEvent.event}" securely added.`);
    setTimelineEvent({ date: '', event: '', description: '' });
    setShowEditTimeline(false);
    setTimelineSignatureVerified(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <Link to="/officer/cases" className="flex items-center text-violet-700 hover:text-violet-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Cases
          </Link>
          <button className="flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Case Brief
          </button>
        </div>

        {/* Header Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-mono text-sm font-semibold text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
                  {caseData.caseId || caseData.id}
                </span>
                {caseData.isCrossAgency && (
                  <span className="flex items-center text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                    <Share2 className="w-3 h-3 mr-1" /> Cross-Agency
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-violet-900 mb-2">
                {caseData.title}
              </h1>
              <p className="text-slate-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> {caseData.location || 'Jurisdiction Area'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                caseData.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                caseData.status?.toLowerCase() === 'court' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {caseData.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                caseData.priority?.toLowerCase() === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                caseData.priority?.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                Priority: {caseData.priority || 'Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Three Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Case Info Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-serif font-semibold text-violet-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" /> Case Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Crime Type</p>
                  <p className="font-medium text-slate-800">{caseData.type || 'General Investigation'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Filed Date</p>
                  <p className="font-medium text-slate-800 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-slate-400" />
                    {caseData.date || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Investigating Officer (IO)</p>
                  <p className="font-medium text-slate-800 flex items-center">
                    <User className="w-4 h-4 mr-1 text-slate-400" />
                    {caseData.officer || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Station / Department</p>
                  <p className="font-medium text-slate-800">{caseData.station || 'Central Division'}</p>
                </div>
                
                <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                  <p className="text-slate-500 mb-1">Assigned Team</p>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                      Insp. R. Sharma (Lead)
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Sub-Insp. A. Patel
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Const. M. Kumar
                    </span>
                  </div>
                </div>

                {caseData.isCrossAgency && (
                  <div className="md:col-span-2 pt-2 border-t border-slate-100">
                    <p className="text-slate-500 mb-1">Shared With (Cross-Agency)</p>
                    <p className="font-medium text-slate-800 flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-slate-400" />
                      CBI, Narcotics Control Bureau (Read-Only)
                    </p>
                  </div>
                )}
                
                <div className="md:col-span-2 pt-2 border-t border-slate-100">
                  <p className="text-slate-500 mb-1">Linked Cases</p>
                  <p className="font-medium text-violet-600 flex items-center hover:underline cursor-pointer">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    FIR-2026-089 (Similar Modus Operandi)
                  </p>
                </div>
              </div>
            </div>

            {/* Case Timeline */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-xl font-serif font-semibold text-violet-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" /> Case Progression
              </h2>
              <CaseTimeline 
                stages={caseData.timeline || defaultTimeline} 
                currentStep={statusStep} 
                totalStages={9} 
              />
            </div>

            {/* Evidence & Documents */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif font-semibold text-violet-800 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2" /> Evidence & Documents
                </h2>
                <button 
                  onClick={() => setShowUploadEvidence(!showUploadEvidence)}
                  className="text-sm px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors flex items-center font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Filename</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Uploaded By</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceList.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-violet-500" />
                          {item.filename}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs">{item.type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.uploadedBy}</td>
                        <td className="px-4 py-3 text-slate-600">{item.date}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 text-violet-600 hover:bg-violet-100 rounded transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {evidenceList.length === 0 && (
                  <p className="text-center text-slate-500 py-6">No evidence attached yet.</p>
                )}
              </div>
            </div>

            {/* Formal Case Chat */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <FormalCaseChat 
                caseId={caseData.caseId || caseData.id} 
                caseName={caseData.title} 
                currentStage={caseData.status} 
              />
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Upload Evidence Gated Section */}
            {showUploadEvidence && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-200 shadow-sm p-6 animate-scale-in">
                <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" /> Upload Evidence
                </h3>
                
                {!signatureVerified ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-2">Cryptographic signature required to upload verified evidence to this case file. Please complete the signature verification prompt.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEvidenceUpload} className="space-y-4 animate-fade-in-up">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-800">Identity verified. Your digital signature will be appended to the uploaded file.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                      <input 
                        type="file" 
                        onChange={(e) => setEvidenceFile(e.target.files[0])}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" 
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <button 
                        type="submit"
                        className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                      >
                        Sign & Upload
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowUploadEvidence(false);
                          setSignatureVerified(false);
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowEditTimeline(!showEditTimeline)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700"
                >
                  <FileText className="w-4 h-4 mr-3 text-violet-600" /> Edit Case Plan / Timeline <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">SIG</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <Shield className="w-4 h-4 mr-3 text-violet-600" /> Request Inter-Agency Access
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <Send className="w-4 h-4 mr-3 text-violet-600" /> Transfer Case
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-colors flex items-center text-sm font-medium text-slate-700">
                  <AlertTriangle className="w-4 h-4 mr-3 text-rose-500" /> Mark as Urgent
                </button>
              </div>
            </div>

            {/* Case Audit Log */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Case Audit Log
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {caseAuditLog.map((log, index) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {log.verified && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-100 bg-white/50 shadow-sm text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-800 text-xs">{log.action}</span>
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">{log.by}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowAuditModal(true)}
                className="w-full mt-4 text-xs font-medium text-violet-600 hover:text-violet-800 flex justify-center items-center"
              >
                View Full Logs <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
              </button>
            </div>

            {/* Edit Timeline Gated Section */}
            {showEditTimeline && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-200 shadow-sm p-6 animate-scale-in">
                <h3 className="text-lg font-serif font-semibold text-violet-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" /> Edit Case Plan / Timeline
                </h3>
                
                {!timelineSignatureVerified ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-2">Cryptographic signature required to update the official case timeline. Please complete the signature verification prompt.</p>
                  </div>
                ) : (
                  <form onSubmit={handleTimelineUpdate} className="space-y-4 animate-fade-in-up">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-800">Identity verified. Your digital signature will be appended to this timeline event.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input 
                        type="date" 
                        value={timelineEvent.date}
                        onChange={(e) => setTimelineEvent({...timelineEvent, date: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Witness Interview"
                        value={timelineEvent.event}
                        onChange={(e) => setTimelineEvent({...timelineEvent, event: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea 
                        rows="2"
                        placeholder="Details of the event..."
                        value={timelineEvent.description}
                        onChange={(e) => setTimelineEvent({...timelineEvent, description: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white resize-none" 
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <button 
                        type="submit"
                        className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                      >
                        Sign & Add Event
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowEditTimeline(false);
                          setTimelineSignatureVerified(false);
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Signature Verification Modals (Root Level) */}
      <SignatureVerification 
        isOpen={showUploadEvidence && !signatureVerified}
        onClose={() => setShowUploadEvidence(false)}
        onVerified={() => setSignatureVerified(true)} 
        actionName="Evidence Upload"
        officerName="Insp. R. Sharma"
      />

      <SignatureVerification 
        isOpen={showEditTimeline && !timelineSignatureVerified}
        onClose={() => setShowEditTimeline(false)}
        onVerified={() => setTimelineSignatureVerified(true)} 
        actionName="Timeline Update"
        officerName="Insp. R. Sharma"
      />

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-xl font-serif font-bold text-violet-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Complete Audit Trail
              </h2>
              <button 
                onClick={() => setShowAuditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <AuditTrail caseFilter={caseData.caseId || caseData.id} limit={50} />
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
