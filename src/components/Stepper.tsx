import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StepperProps {
    currentStep: number;
}

const steps = [
    { id: 1, label: 'Configuration' },
    { id: 2, label: 'Titre' },
    { id: 3, label: 'Contenu' },
    { id: 4, label: 'Export' },
];

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    return (
        <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className={twMerge(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                            currentStep === step.id ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" :
                                currentStep > step.id ? "bg-green-600 border-green-600" : "bg-surface border-border text-gray-500"
                        )}>
                            {currentStep > step.id ? (
                                <Check className="w-5 h-5 text-white" />
                            ) : (
                                <span className={clsx("font-bold", currentStep === step.id ? "text-white" : "text-gray-500")}>
                                    {step.id}
                                </span>
                            )}
                        </div>
                        <span className={clsx(
                            "text-xs font-semibold tracking-wide uppercase",
                            currentStep === step.id ? "text-blue-500" : "text-gray-500"
                        )}>
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="flex-1 h-[2px] bg-border mx-4 -mt-6">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: currentStep > step.id ? '100%' : '0%' }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
