import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import './AgentStatus.css';

export default function AgentStatus({ statusSteps, currentStep }) {
  if (statusSteps.length === 0) return null;

  return (
    <div className="agent-status glass-panel animate-fade-in">
      <h3>Agent Status</h3>
      <div className="steps-container">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className={`status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-icon">
                {isCompleted ? (
                  <CheckCircle2 size={24} className="icon-completed" />
                ) : isCurrent ? (
                  <Loader2 size={24} className="icon-current animate-spin" />
                ) : (
                  <Circle size={24} className="icon-pending" />
                )}
              </div>
              <div className="step-content">
                <p className="step-label">{step}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
