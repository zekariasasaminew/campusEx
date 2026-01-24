"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "./button";
import styles from "./toast.module.css";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function Toast({
  message,
  variant = "info",
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible || duration === 0) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const Icon = icons[variant];

  return (
    <div
      className={`${styles.toast} ${styles[variant]}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="Close notification"
        className={styles.closeButton}
      >
        <X size={16} />
      </Button>
    </div>
  );
}
