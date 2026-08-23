import React from "react";

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between py-3 border-y border-gray-200 my-2">
            <span className="text-[0.9rem] font-medium text-text-main mr-4">
                {label}
            </span>
            <label className="relative inline-block w-12 h-[26px] cursor-pointer shrink-0">
                <input 
                    type="checkbox" 
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="opacity-0 w-0 h-0" 
                />
                <span className={`absolute inset-0 rounded-full transition-all duration-300 ${checked ? 'bg-primary' : 'bg-gray-300'}`}>
                    <span className={`absolute h-5 w-5 bg-white rounded-full transition-all duration-300 shadow-md bottom-[3px] ${checked ? 'left-[25px]' : 'left-[3px]'}`} />
                </span>
            </label>
        </div>
    );
};