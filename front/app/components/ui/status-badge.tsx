import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    confirmed: {
      color: "bg-green-500/20 text-green-400",
      icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
    },
    cancelled: {
      color: "bg-red-500/20 text-red-400",
      icon: <XCircle className="w-4 h-4 mr-1" />,
    },
    pending: {
      color: "bg-yellow-500/20 text-yellow-400",
      icon: <Clock className="w-4 h-4 mr-1" />,
    },
    completed: {
      color: "bg-blue-500/20 text-blue-400",
      icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
    },
    error: {
      color: "bg-red-500/20 text-red-400",
      icon: <AlertCircle className="w-4 h-4 mr-1" />,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-1 rounded-full ${config.color} text-xs flex items-center w-fit`}
    >
      {config.icon}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
}
