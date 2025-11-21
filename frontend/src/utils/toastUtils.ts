// ============================================
// TOAST NOTIFICATION UTILITIES
// ============================================
// Modern, clean toast notifications using react-hot-toast

import toast from 'react-hot-toast';

/**
 * Shows a success toast notification with a green checkmark
 * @param message - Success message to display
 * @param duration - Optional duration in milliseconds (default: 4000ms)
 */
export function showSuccessToast(message: string, duration: number = 4000) {
  return toast.success(message, {
    duration,
    style: {
      background: '#10B981', // emerald-500
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#10B981',
    },
  });
}

/**
 * Shows an error toast notification with a red X
 * @param message - Error message to display
 * @param duration - Optional duration in milliseconds (default: 5000ms)
 */
export function showErrorToast(message: string, duration: number = 5000) {
  return toast.error(message, {
    duration,
    style: {
      background: '#EF4444', // red-500
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#EF4444',
    },
  });
}

/**
 * Shows an info toast notification
 * @param message - Info message to display
 * @param duration - Optional duration in milliseconds (default: 4000ms)
 */
export function showInfoToast(message: string, duration: number = 4000) {
  return toast(message, {
    duration,
    icon: 'ℹ️',
    style: {
      background: '#3B82F6', // blue-500
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  });
}

/**
 * Shows a warning toast notification
 * @param message - Warning message to display
 * @param duration - Optional duration in milliseconds (default: 4500ms)
 */
export function showWarningToast(message: string, duration: number = 4500) {
  return toast(message, {
    duration,
    icon: '⚠️',
    style: {
      background: '#F59E0B', // amber-500
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  });
}

/**
 * Shows a loading toast that can be updated later
 * @param message - Loading message to display
 * @returns Toast ID that can be used to update or dismiss the toast
 */
export function showLoadingToast(message: string = 'Loading...') {
  return toast.loading(message, {
    style: {
      background: '#6B7280', // gray-500
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
}

/**
 * Dismisses a specific toast by ID
 * @param toastId - ID of the toast to dismiss
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/**
 * Dismisses all active toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}
