import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm transition-opacity" onClick={isLoading ? undefined : onCancel} />
      
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all sm:my-8 sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-saffron/10 text-saffron'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="mt-1 flex-1">
            <h3 className="font-display text-xl font-bold text-navy">{title}</h3>
            <p className="mt-2 text-sm text-ink/70">{description}</p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="inline-flex w-full justify-center rounded-xl border border-navy/10 bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-sm transition-all hover:bg-gray-50 sm:w-auto"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all sm:w-auto disabled:opacity-70 ${
              isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-navy hover:bg-saffron"
            }`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
