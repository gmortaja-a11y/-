
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
}

const NOTIFICATION_CONFIG = {
  success: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    icon: '✅',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-rose-500',
    icon: '❌',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-sky-500',
    icon: 'ℹ️',
  },
};

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            const dismissTimer = setTimeout(onDismiss, 500); // Wait for animation
            return () => clearTimeout(dismissTimer);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onDismiss]);
    
    const handleDismiss = () => {
        setExiting(true);
        setTimeout(onDismiss, 500);
    }

    const config = NOTIFICATION_CONFIG[type];

    return (
        <div
            className={`relative flex items-center p-4 mb-4 text-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500
                ${config.bg} 
                ${exiting ? 'animate-slide-up-fade-out' : 'animate-slide-down'}`
            }
        >
            <span className="text-xl mr-3">{config.icon}</span>
            <p className="font-semibold">{message}</p>
            <button onClick={handleDismiss} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/70 hover:text-white">&times;</button>
        </div>
    );
};

export default Notification;
