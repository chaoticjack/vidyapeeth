import React, { useState } from "react";
import { writeBatch, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Edit3, Lock, Unlock, Eye, X, CheckSquare, Settings } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface BulkActionBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
  lessonsMap: Record<string, any>;
  modulesMap: Record<string, any>;
}

export function BulkActionBar({ selectedIds, onClear, lessonsMap, modulesMap }: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: string; desc: string } | null>(null);

  if (selectedIds.size === 0) return null;

  const getCollectionName = (id: string) => {
    if (lessonsMap[id]) return "lessons";
    if (modulesMap[id]) return "modules";
    return null;
  };

  const handleAction = async (action: string) => {
    if (action === "delete") {
      setConfirmDialog({ isOpen: true, action, desc: `Are you sure you want to delete ${selectedIds.size} items?` });
      return;
    }
    await processBulk(action);
  };

  const processBulk = async (action: string) => {
    setIsProcessing(true);
    try {
      let batch = writeBatch(db);
      let count = 0;

      for (const id of selectedIds) {
        const collection = getCollectionName(id);
        if (!collection) continue;

        const ref = doc(db, collection, id);
        
        switch (action) {
          case "delete":
            batch.delete(ref);
            break;
          case "publish":
            batch.update(ref, { status: "active", updatedAt: serverTimestamp() });
            break;
          case "lock":
            batch.update(ref, { isFree: false, isPreview: false, updatedAt: serverTimestamp() });
            break;
          case "unlock":
            batch.update(ref, { isFree: true, updatedAt: serverTimestamp() });
            break;
        }

        count++;
        if (count === 490) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      toast.success(`Successfully processed ${selectedIds.size} items!`);
      onClear();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to perform bulk action");
    } finally {
      setIsProcessing(false);
      setConfirmDialog(null);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="bg-[#0a1220] rounded-2xl shadow-2xl border border-white/10 px-6 py-4 flex items-center gap-6">
          <div className="flex flex-col">
             <span className="text-white font-bold">{selectedIds.size} selected</span>
             <span className="text-xs text-white/50">Curriculum Items</span>
          </div>

          <div className="h-8 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <button disabled={isProcessing} onClick={() => handleAction("publish")} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Eye size={16} /> Publish
            </button>
            <button disabled={isProcessing} onClick={() => handleAction("unlock")} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Unlock size={16} /> Unlock
            </button>
            <button disabled={isProcessing} onClick={() => handleAction("lock")} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Lock size={16} /> Lock
            </button>
            <div className="h-6 w-px bg-white/20 mx-2" />
            <button disabled={isProcessing} onClick={() => handleAction("delete")} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors">
              <Trash2 size={16} /> Delete
            </button>
          </div>

          <button disabled={isProcessing} onClick={onClear} className="ml-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!confirmDialog} 
        onCancel={() => setConfirmDialog(null)}
        onConfirm={() => processBulk(confirmDialog?.action || "")}
        title="Confirm Bulk Action"
        description={confirmDialog?.desc || ""}
        confirmText="Yes, execute"
      />
    </>
  );
}
