import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockFIRs, additionalFIRs } from '../../data/mockData';
import CaseTimeline from '../../components/shared/CaseTimeline';
import { 
  ArrowLeft, Download, MapPin, Calendar, User, 
  File, Phone, Mail, FileText, AlertCircle, 
  ShieldCheck, ArrowRight, HelpCircle
} from 'lucide-react';

export default function FIRDetail() {
  const { id } = useParams();

  const allFIRs = [...(mockFIRs || []), ...(additionalFIRs || [])];
  
  const fir = allFIRs.find(f => f.id === id || f.firId === id) || {
    id: id,
    firId: id || 'FIR-XXXX',
    title: 'Unknown FIR',
    status: 'Filed',
    date: 'Unknown',
    location: 'Unknown',
    officer: 'Unassigned',
    station: 'Unknown Station',
    type: 'General',
  };

  const statusMap = {
    'filed': { step: 1, color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Filed' },
    'Filed': { step: 1, color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Filed' },
    'investigation': { step: 2, color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Under Investigation' },
    'Investigation': { step: 2, color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Under Investigation' },
    'chargesheet': { step: 4, color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Chargesheet Filed' },
    'court': { step: 4, color: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'In Court' },
    'disposed': { step: 5, color: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Disposed' },
  };

  const currentStatus = statusMap[fir.status] || statusMap['filed'];
  const statusStep = currentStatus.step;

  const defaultCitizenTimeline = [
    { date: fir.date || 'TBD', event: 'FIR Registered', description: 'Your FIR has been successfully registered in the system.' },
    { date: statusStep > 1 ? 'Updated' : 'Pending', event: 'Under Investigation', description: 'Investigating Officer collects evidence and statements.' },
    { date: 'Pending', event: 'Evidence Collection', description: 'Active field investigation.' },
    { date: 'Pending', event: 'Chargesheet Filed', description: 'Formal charges filed in court.' },
    { date: 'Pending', event: 'Disposed', description: 'Final court verdict delivered or case closed.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <Link to="/citizen/dashboard" className="flex items-center text-purple-700 hover:text-purple-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My FIRs
          </Link>
          <button className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors shadow-sm text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Download Copy
          </button>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 flex items-center ${currentStatus.bg} ${currentStatus.border} border shadow-sm animate-scale-in`}>
          <div className={`w-3 h-3 rounded-full ${currentStatus.color} animate-pulse mr-3`}></div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-0.5">Current Status</p>
            <p className={`font-semibold text-lg ${currentStatus.text}`}>{currentStatus.label}</p>
          </div>
          <ShieldCheck className={`w-8 h-8 opacity-20 ${currentStatus.text}`} />
        </div>

        {/* FIR Header Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 border-b border-purple-50 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-md">
                  {fir.firId || fir.id}
                </span>
                <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {fir.type || 'General'}
                </span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                {fir.title}
              </h1>
              <p className="text-slate-600 flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-1" /> {fir.location || 'Incident Location'}
              </p>
            </div>
            
            <div className="text-left md:text-right">
              <p className="text-slate-500 text-sm mb-1">Date Filed</p>
              <p className="font-medium text-slate-800 flex items-center md:justify-end">
                <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                {fir.date || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Police Station</p>
              <p className="font-medium text-slate-800">{fir.station || 'Local Police Station'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Investigating Officer</p>
              <p className="font-medium text-slate-800 flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-500" />
                {fir.officer || 'Pending Assignment'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout for the rest */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Case Timeline */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-serif font-semibold text-slate-800 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" /> Track Progress
              </h2>
              <CaseTimeline 
                stages={fir.timeline || defaultCitizenTimeline} 
                currentStep={statusStep} 
                totalStages={5} 
              />
            </div>

            {/* Documents */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-lg font-serif font-semibold text-slate-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" /> Attached Documents
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center">
                    <File className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Original FIR Copy.pdf</p>
                      <p className="text-xs text-slate-500">Auto-generated • {fir.date}</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-800 p-2 bg-white rounded-md shadow-sm">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            
            {/* Next Steps */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-serif font-semibold text-lg mb-3 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-purple-200" /> What happens next?
              </h3>
              <p className="text-sm text-purple-100 mb-4 leading-relaxed">
                {statusStep === 1 ? 'Your FIR has been registered. An Investigating Officer (IO) will be assigned shortly to begin the inquiry.' :
                 statusStep === 2 ? 'The IO is currently gathering evidence. You may be contacted to provide additional statements if required.' :
                 'The investigation is progressing. Check back for court updates.'}
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                Read Citizen Guide <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Contact IO */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow-md p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-lg font-serif font-semibold text-slate-800 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" /> Contact Officer
              </h3>
              
              <div className="flex items-center mb-4 pb-4 border-b border-purple-50">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{fir.officer || 'Unassigned'}</p>
                  <p className="text-xs text-slate-500">Investigating Officer</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center py-2.5 px-4 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors border border-purple-100">
                  <Phone className="w-4 h-4 mr-2" /> Call Station
                </button>
                <button className="w-full flex items-center justify-center py-2.5 px-4 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors border border-slate-200">
                  <Mail className="w-4 h-4 mr-2" /> Message Officer
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure Activity icon is imported
function Activity(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
