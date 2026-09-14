import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import StatusBadge from '../../components/shared/StatusBadge';
import { mockFIRs } from '../../data/mockData';
import { 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  List, 
  ArrowRight,
  Clock
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const recentFIRs = mockFIRs ? mockFIRs.slice(0, 3) : [];

  const stats = [
    { label: t('totalFirsFiled') || 'Total FIRs Filed', value: 4, icon: <FileText size={24} className="text-navy" />, bgColor: 'bg-navy-50' },
    { label: t('activeCases') || 'Active Cases', value: 2, icon: <Activity size={24} className="text-saffron" />, bgColor: 'bg-saffron-50' },
    { label: t('resolvedCases') || 'Resolved', value: 1, icon: <CheckCircle size={24} className="text-forest" />, bgColor: 'bg-green-50' },
    { label: t('pendingAction') || 'Pending Action', value: 1, icon: <AlertCircle size={24} className="text-alert" />, bgColor: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/citizen' }]} />
        
        {/* Welcome Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-charcoal font-sans">
            {t('welcomeBack') || 'Welcome back'}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboardDescription') || 'Manage your FIRs and track justice progress digitally.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 bg-white border-l-4 ${
              index === 0 ? 'border-navy' : index === 1 ? 'border-saffron' : index === 2 ? 'border-forest' : 'border-alert'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-charcoal mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link to="/citizen/log-fir" className="group">
            <div className="bg-navy rounded-xl p-8 flex items-center justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-white h-full">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <PlusCircle /> {t('logNewFir') || 'Log New FIR'}
                </h2>
                <p className="text-navy-100 opacity-90">File a new First Information Report completely online.</p>
              </div>
              <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform opacity-70 group-hover:opacity-100" />
            </div>
          </Link>
          
          <Link to="/citizen/view-firs" className="group">
            <div className="bg-white border-2 border-navy rounded-xl p-8 flex items-center justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full text-navy">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <List /> {t('viewMyFirs') || 'View My FIRs'}
                </h2>
                <p className="text-gray-600">Track status and updates on your submitted reports.</p>
              </div>
              <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform text-navy opacity-70 group-hover:opacity-100" />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
              <Clock size={20} className="text-saffron" />
              {t('recentActivity') || 'Recent Activity'}
            </h2>
            <Link to="/citizen/view-firs" className="text-sm text-navy hover:underline font-medium">
              {t('viewAll') || 'View All'}
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentFIRs.length > 0 ? (
              recentFIRs.map((fir) => (
                <div key={fir.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-charcoal">{fir.title || fir.type}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {fir.trackingId || fir.id}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{fir.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{fir.date}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={fir.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p>No recent FIRs found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
