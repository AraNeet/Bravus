import type React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center mb-8">
      {icon}
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-white/60 mb-6">{description}</p>
      {action}
    </div>
  );
}
