import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CaseTimeline from '../../components/shared/CaseTimeline';
import { formatDate } from '../../utils/helpers';
import { 
  ArrowLeft, Download, MapPin, Calendar, User, 
  File, Phone, Mail, FileText, AlertCircle, 
  ShieldCheck, ArrowRight, HelpCircle, Loader2
} from 'lucide-react';

export default function FIRDetail() {
  const { id } = useParams();
  
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFir = async () => {
      try {
        const token = localStorage.getItem('anveshak_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_URL}/fir/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if(res.ok) {
          const f = data.fir;
          setFir({
            id: f._id,
            firId: f.firNumber,
            title: `${f.category || 'General'} FIR`,
            status: f.status || 'FILED',
            date: f.incidentDate || f.createdAt,
            location: f.incidentLocation || 'Unknown',
            officer: 'Assigned by Dept',
            station: 'Local Jurisdiction',
            type: f.category || 'General',
            description: f.incidentDescription || 'No description',
            complainant: f.complainant || 'Citizen'
          });
        } else {
          setError(data.message || 'Error fetching FIR');
        }
      } catch(e) {
        console.error(e);
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };
    fetchFir();
  }, [id]);

  const statusMap = {
    'FILED': { step: 1, color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Filed' },
    'UNDER_INVESTIGATION': { step: 2, color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Under Investigation' },
    'RESOLVED': { step: 5, color: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Disposed' },
  };

  if(loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>;
  if(error) return <div className="p-8 text-red-600 font-bold">{error}</div>;
  if(!fir) return null;

  const currentStatus = statusMap[fir.status] || statusMap['FILED'];
  const statusStep = currentStatus.step;

  const defaultCitizenTimeline = [
    { date: formatDate(fir.date), event: 'FIR Registered', description: 'Your FIR has been successfully registered in the system.' },
    { date: statusStep > 1 ? 'Updated' : 'Pending', event: 'Under Investigation', description: 'Investigating Officer collects evidence and statements.' },
    { date: statusStep > 3 ? 'Updated' : 'Pending', event: 'Chargesheet Filed', description: 'Formal charges filed in court.' },
    { date: statusStep === 5 ? 'Updated' : 'Pending', event: 'Disposed', description: 'Final court verdict delivered or case closed.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/citizen/view-firs" className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-semibold bg-white/60 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white">
            <ArrowLeft size={18} /> Back to My FIRs
          </Link>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg">
            <Download size={18} /> Download Copy
          </button>
        </div>

        {/* Main Case Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">
          {/* Status Header */}
          <div className={`${currentStatus.bg} px-6 md:px-10 py-6 border-b ${currentStatus.border} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 ${currentStatus.color} text-white shadow-sm`}>
                Status: {currentStatus.label}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{fir.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="font-mono text-gray-600 font-medium">ID: {fir.firId}</span>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-2xl p-4 border border-white shadow-inner flex flex-col gap-1 min-w-[200px]">
              <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                <Calendar size={16} className="text-indigo-500" /> Filed: {formatDate(fir.date)}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                <MapPin size={16} className="text-indigo-500" /> {fir.location}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 p-6 md:p-10 space-y-10">
              
              <section>
                <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                  <FileText size={16} /> Incident Description
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed font-medium bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  {fir.description}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                  <User size={16} /> Complainant Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold mb-1">Name</p>
                    <p className="text-gray-900 font-semibold">{fir.complainant}</p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Tracking & Timeline */}
            <div className="p-6 md:p-10 bg-gray-50/30">
              <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Case Tracking
              </h3>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
                <p className="text-xs text-gray-500 font-bold mb-1">Investigating Officer</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {fir.officer.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">{fir.officer}</p>
                    <p className="text-xs text-gray-500">{fir.station}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <CaseTimeline 
                  stages={defaultCitizenTimeline} 
                  currentStep={statusStep - 1} 
                  totalStages={4} 
                />
              </div>

              <div className="mt-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">Need Help?</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      If you have additional evidence or information, please visit your local station or contact the IO directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
