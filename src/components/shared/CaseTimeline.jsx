import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Calendar
} from 'lucide-react';

const CaseTimeline = ({ stages = [], currentStep = 0, totalStages = 9 }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (index) => {
    setExpandedNodes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const percentage = Math.round((currentStep / totalStages) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 glass-card rounded-xl">
      {/* Progress Bar */}
      <div className="mb-8 p-4 glass rounded-lg border border-navy/20">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-serif text-xl text-navy font-bold">Case Progress</h3>
          <span className="text-sm font-medium text-navy/80">{percentage}% Complete — Stage {currentStep} of {totalStages}</span>
        </div>
        <div className="w-full h-3 bg-cream rounded-full overflow-hidden">
          <div 
            className="h-full bg-saffron transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 md:ml-8">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;
          const isLast = index === stages.length - 1;
          const isExpanded = !!expandedNodes[index];

          return (
            <div key={index} className="relative mb-8 scale-in float-slow">
              {/* Connecting Line */}
              {!isLast && (
                <div 
                  className={`absolute left-[15px] top-10 bottom-[-40px] w-1.5 transition-all duration-500
                    ${isCompleted 
                      ? 'bg-navy/80 shadow-[0_0_10px_rgba(0,0,128,0.5)]' 
                      : 'bg-charcoal/20 border-l-2 border-dashed border-charcoal/30 bg-transparent'}`}
                />
              )}

              <div className="flex items-start gap-4 md:gap-6 relative z-10">
                {/* Node Icon */}
                <div className="flex-shrink-0 mt-1">
                  {isCompleted && (
                    <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center shadow-lg">
                      <CheckCircle size={18} />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75"></span>
                      <div className="relative w-8 h-8 rounded-full bg-saffron text-navy flex items-center justify-center shadow-xl border-2 border-cream">
                        <Clock size={18} />
                      </div>
                    </div>
                  )}
                  {isPending && (
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-charcoal/40 bg-cream flex items-center justify-center text-charcoal/40">
                      <div className="w-2 h-2 rounded-full bg-charcoal/20"></div>
                    </div>
                  )}
                </div>

                {/* Node Content */}
                <div className="flex-grow glass p-4 rounded-lg border hover:border-navy/30 transition-colors duration-300 cursor-pointer"
                     onClick={() => toggleNode(index)}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h4 className={`font-bold text-lg ${isPending ? 'text-charcoal/60' : 'text-navy'}`}>
                        {stage.event}
                      </h4>
                      <div className="flex items-center gap-4 text-sm mt-1 text-charcoal/80">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {stage.date}</span>
                        {stage.by && <span className="flex items-center gap-1"><User size={14}/> {stage.by}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {stage.documents && stage.documents.length > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-navy/10 text-navy px-2 py-1 rounded-full font-medium">
                          <FileText size={12} /> {stage.documents.length} File{stage.documents.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${isCompleted ? 'bg-forest/20 text-forest' : 
                          isCurrent ? 'bg-saffron/20 text-saffron' : 
                          'bg-charcoal/10 text-charcoal/60'}`}>
                        {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-navy/50" /> : <ChevronDown size={20} className="text-navy/50" />}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-charcoal/10">
                      <p className="text-sm text-charcoal mb-4">{stage.description}</p>
                      
                      {stage.documents && stage.documents.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-navy uppercase tracking-wider">Attached Documents</h5>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {stage.documents.map((doc, dIdx) => (
                              <li key={dIdx} className="flex items-center gap-2 text-sm p-2 rounded bg-cream border border-charcoal/10 hover:border-navy/30 transition-colors">
                                <FileText size={16} className="text-saffron" />
                                <span className="truncate text-navy">{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseTimeline;
