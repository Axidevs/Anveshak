import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { Bell, Smartphone, Mail, MessageCircle, Save, Check } from 'lucide-react';

const AlertSettings = () => {
  const { t } = useLanguage();
  const [showToast, setShowToast] = useState(false);

  const [settings, setSettings] = useState({
    hearingReminders: { active: true, sms: true, email: true, whatsapp: false },
    statusChanges: { active: true, sms: true, email: false, whatsapp: true },
    newDocuments: { active: false, sms: false, email: true, whatsapp: false },
    orderDueDates: { active: true, sms: true, email: true, whatsapp: false },
    citizenNotifications: { active: true, sms: true, email: false, whatsapp: true }
  });

  const [schedule, setSchedule] = useState('1 day before');
  const [citizenTemplate, setCitizenTemplate] = useState('Your case {CASE_ID} status has been updated to {STATUS}. Next hearing on {DATE}.');

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const handleMethodToggle = (key, method) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], [method]: !prev[key][method] }
    }));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const NotificationRow = ({ id, label, description }) => (
    <div className="p-5 bg-white border-b border-gray-100 last:border-0 hover:bg-cream transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-charcoal">{label}</h3>
            <button 
              onClick={() => handleToggle(id)}
              className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings[id].active ? 'bg-forest' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={settings[id].active}
              aria-label={`Toggle ${label}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings[id].active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-sm text-charcoal/60">{description}</p>
        </div>
        
        <div className={`flex gap-4 ${!settings[id].active ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-navy focus:ring-navy w-4 h-4 cursor-pointer"
              checked={settings[id].sms}
              onChange={() => handleMethodToggle(id, 'sms')}
            />
            <span className="text-sm text-charcoal/80 flex items-center gap-1"><Smartphone size={14} className="group-hover:text-navy transition-colors"/> SMS</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-navy focus:ring-navy w-4 h-4 cursor-pointer"
              checked={settings[id].email}
              onChange={() => handleMethodToggle(id, 'email')}
            />
            <span className="text-sm text-charcoal/80 flex items-center gap-1"><Mail size={14} className="group-hover:text-navy transition-colors"/> Email</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-navy focus:ring-navy w-4 h-4 cursor-pointer"
              checked={settings[id].whatsapp}
              onChange={() => handleMethodToggle(id, 'whatsapp')}
            />
            <span className="text-sm text-charcoal/80 flex items-center gap-1"><MessageCircle size={14} className="group-hover:text-green-600 transition-colors"/> WA</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <Breadcrumb items={[
        { label: 'Court Dashboard', path: '/court' },
        { label: 'Alert Settings', path: '/court/alerts' }
      ]} />

      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-forest text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
          <Check size={18} />
          <span className="font-medium">Settings saved successfully</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="text-navy" size={24} />
          <h1 className="text-2xl font-bold text-navy">Notification & Alert Settings</h1>
        </div>
        <p className="text-charcoal/70">Configure automated alerts for court staff and citizens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-navy-50 p-4 border-b border-gray-100">
              <h2 className="font-bold text-navy text-lg">Alert Categories</h2>
            </div>
            
            <div className="flex flex-col">
              <NotificationRow 
                id="hearingReminders" 
                label="Hearing Reminders" 
                description="Automated reminders for upcoming scheduled hearings." 
              />
              <NotificationRow 
                id="statusChanges" 
                label="Case Status Changes" 
                description="Alerts when a case moves to a new stage." 
              />
              <NotificationRow 
                id="newDocuments" 
                label="New Documents Filed" 
                description="Notifications when parties upload new evidentiary documents." 
              />
              <NotificationRow 
                id="orderDueDates" 
                label="Order Due Dates" 
                description="Internal alerts for pending court orders nearing deadline." 
              />
              <NotificationRow 
                id="citizenNotifications" 
                label="Citizen Notifications" 
                description="Auto-send updates to involved citizens." 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-navy text-lg mb-4">Notification Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-2">
                  Send hearing reminders:
                </label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  aria-label="Reminder schedule"
                >
                  <option value="On the day">On the day (Morning)</option>
                  <option value="1 day before">1 day before</option>
                  <option value="2 days before">2 days before</option>
                  <option value="1 week before">1 week before</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-navy text-lg mb-4">Citizen SMS Template</h2>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal/80">
                Automated status update format:
              </label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent text-charcoal text-sm h-32 resize-none"
                value={citizenTemplate}
                onChange={(e) => setCitizenTemplate(e.target.value)}
                aria-label="SMS Template"
              />
              <p className="text-xs text-charcoal/50">
                Available variables: {'{CASE_ID}'}, {'{STATUS}'}, {'{DATE}'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-navy text-white p-3 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-sm hover:shadow-md"
          >
            <Save size={18} /> Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;
