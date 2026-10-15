import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  maxCompletedStepIndex?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  maxCompletedStepIndex = 0,
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-800 -z-0" />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isNavigable = idx <= Math.max(maxCompletedStepIndex, currentStepIndex);

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center relative z-10 ${
                isNavigable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
              onClick={() => {
                if (isNavigable && onStepClick) {
                  onStepClick(idx);
                }
              }}
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : isCurrent
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-950/40 ring-4 ring-amber-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Title */}
              <span
                className={`mt-2 text-xs font-semibold text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-amber-400'
                    : isCompleted
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>

              {step.subtitle && (
                <span className="text-[11px] text-slate-400 text-center hidden md:block">
                  {step.subtitle}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
