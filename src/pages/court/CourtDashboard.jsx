import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockCourtCases } from '../../data/mockData';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { Link } from 'react-router-dom';
import { Scale, Users, FileText, Calendar, Bell, ChevronRight, Clock, AlertCircle, Briefcase } from 'lucide-react';

const CourtDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // "Today's Cause List" filtering logic (simulated for today)
  const [todaysCauseList] = useState([
    { id: 'ANV-2026-0342', title: 'State vs. Rohit Mehra & Anr.', hearingDate: 'Sept 10, 2026', time: '10:30 AM', category: 'Hearing' },
    { id: 'ANV-2026-0298', title: 'State vs. Cyber Fraud Syndicate', hearingDate: 'Sept 10, 2026', time: '11:00 AM', category: 'Arguments' },
    { id: 'ANV-2026-1045', title: 'State vs. Rahul Verma', hearingDate: 'Sept 10, 2026', time: '02:00 PM', category: 'Judgment' }
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('courtDashboard') || 'Court Dashboard', path: '/court' }]} />
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D91] mb-1">
            Welcome back, Honorable {user?.name || 'Judge'}
          </h1>
          <p className="text-[#1A1A1A]/70">
            {t('overviewText') || 'Here is the overview of your court docket today.'}
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm text-[#1A1A1A]/60">Current Date</p>
          <p className="font-semibold text-[#1A1A1A]">Sept 10, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#0B3D91] hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]/60">Cases on Docket</p>
              <h3 className="text-2xl font-bold text-[#0B3D91] mt-1">12</h3>
            </div>
            <div className="bg-[#0B3D91]/10 p-2 rounded-lg text-[#0B3D91]">
              <Scale size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-600 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]/60">Today's Hearings</p>
              <h3 className="text-xl font-bold text-purple-600 mt-1">3</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Calendar size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]/60">Pending Orders</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">2</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-500">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-600 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]/60">Disposed (Month)</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">8</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <FileText size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#0B3D91]">Today's Cause List</h2>
            <Link to="/court/proceedings" className="text-sm font-medium text-[#0B3D91] hover:text-[#0B3D91]/80 flex items-center">
              View Calendar <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {todaysCauseList.length === 0 ? (
              <p className="text-[#1A1A1A]/60">No hearings scheduled for today.</p>
            ) : (
              todaysCauseList.map((hearing, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-white border border-gray-200 p-2 rounded-lg flex flex-col items-center justify-center min-w-[70px]">
                      <span className="text-xs text-[#1A1A1A]/60 font-semibold">Time</span>
                      <span className="text-sm font-bold text-[#0B3D91] whitespace-nowrap">{hearing.time}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">{hearing.title}</h4>
                      <p className="text-sm text-[#1A1A1A]/70 flex items-center gap-1 mt-1">
                        <Scale size={14} /> Case ID: {hearing.id} ? {hearing.category}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-3">
                    <Link 
                      to={`/court/cases/${hearing.id}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#0B3D91] hover:text-white bg-white border border-[#0B3D91]/20 px-3 py-1.5 rounded-lg hover:bg-[#0B3D91] transition-colors whitespace-nowrap"
                    >
                      Open Case ↗
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#0B3D91] mb-6">Quick Links</h2>
          
          <div className="space-y-3">
            <Link to="/court/cases" className="flex items-center gap-3 p-4 rounded-lg bg-[#FAF8F5] hover:bg-[#0B3D91]/5 text-[#1A1A1A] hover:text-[#0B3D91] transition-colors group">
              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-[#0B3D91] group-hover:text-white transition-colors">
                <Briefcase size={18} />
              </div>
              <span className="font-medium">My Cases</span>
            </Link>
            
            <Link to="/court/proceedings" className="flex items-center gap-3 p-4 rounded-lg bg-[#FAF8F5] hover:bg-[#0B3D91]/5 text-[#1A1A1A] hover:text-[#0B3D91] transition-colors group">
              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-[#0B3D91] group-hover:text-white transition-colors">
                <Calendar size={18} />
              </div>
              <span className="font-medium">Legal Proceedings</span>
            </Link>
            
            <Link to="/court/alerts" className="flex items-center gap-3 p-4 rounded-lg bg-[#FAF8F5] hover:bg-[#0B3D91]/5 text-[#1A1A1A] hover:text-[#0B3D91] transition-colors group">
              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-[#0B3D91] group-hover:text-white transition-colors">
                <Bell size={18} />
              </div>
              <span className="font-medium">Alert Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDashboard;
