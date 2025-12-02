import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`backdrop-blur-xl bg-gray-900/60 border border-white/10 shadow-2xl rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
