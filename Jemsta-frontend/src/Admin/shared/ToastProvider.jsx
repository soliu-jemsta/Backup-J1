import { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {message}
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showSuccess = (message) =>
    setToast({ type: "success", message });

  const showError = (message) =>
    setToast({ type: "error", message });

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};
