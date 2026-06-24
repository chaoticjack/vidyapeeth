import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { CheckSquare, Square, Eye, Download, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/vsat-registrations")({
  head: () => ({ meta: [{ title: "VSAT Registrations — Admin Portal" }] }),
  component: AdminVsatRegistrations,
});

function AdminVsatRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "vsatRegistrations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load VSAT registrations");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openViewModal = (reg: any) => {
    setSelectedReg(reg);
    setIsViewModalOpen(true);
  };

  const toggleAdmitCard = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "vsatRegistrations", id), {
        admitCardSent: !currentStatus
      });
      toast.success(`Admit card marked as ${!currentStatus ? 'sent' : 'unsent'}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update admit card status");
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return toast.error("No data to export");
    
    const headers = ["Name,Email,Phone,Class,School,City,Date,Admit Card Sent"];
    const csvData = registrations.map(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Unknown';
      return `"${r.studentName}","${r.email}","${r.phone}","${r.classLevel}","${r.school}","${r.city}","${date}","${r.admitCardSent ? 'Yes' : 'No'}"`;
    });
    
    const blob = new Blob([headers.concat(csvData).join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'vsat_registrations.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  let filteredRegistrations = registrations.filter(r => {
    const name = r.studentName || "";
    const email = r.email || "";
    const city = r.city || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           city.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (classFilter !== "all") {
    filteredRegistrations = filteredRegistrations.filter(r => r.classLevel?.toString() === classFilter);
  }

  const columns = [
    { key: "studentName", label: "Student", render: (row: any) => (
      <div>
        <p className="font-semibold text-navy">{row.studentName}</p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    )},
    { key: "classLevel", label: "Class", render: (row: any) => `Class ${row.classLevel}` },
    { key: "city", label: "City", render: (row: any) => row.city },
    { key: "school", label: "School", render: (row: any) => (
      <span className="truncate max-w-[150px] inline-block" title={row.school}>{row.school}</span>
    )},
    { key: "createdAt", label: "Date", render: (row: any) => (
      <span className="text-gray-500 text-xs">
        {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'Unknown'}
      </span>
    )},
    { key: "admitCard", label: "Admit Card", render: (row: any) => (
      <button 
        onClick={() => toggleAdmitCard(row.id, row.admitCardSent)}
        className="flex items-center gap-2 p-1 text-sm font-semibold transition-colors rounded-md hover:bg-gray-100"
      >
        {row.admitCardSent ? (
          <><CheckSquare size={16} className="text-green-600" /> <span className="text-green-700">Sent</span></>
        ) : (
          <><Square size={16} className="text-gray-400" /> <span className="text-gray-500">Pending</span></>
        )}
      </button>
    )},
    { key: "actions", label: "Details", render: (row: any) => (
      <button onClick={() => openViewModal(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Eye size={16} /></button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">VSAT Registrations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admissions test registrations.</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-navy px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1"></div>
        <select 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron bg-white shadow-sm"
        >
          <option value="all">All Classes</option>
          {[6,7,8,9,10,11,12].map(c => <option key={c} value={c.toString()}>Class {c}</option>)}
        </select>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredRegistrations} 
        loading={loading}
        searchPlaceholder="Search by name, email, or city..."
        onSearch={setSearchTerm}
      />

      {isViewModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">Registration Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Student Name</p>
                  <p className="text-sm font-bold text-navy mt-1">{selectedReg.studentName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Parent Name</p>
                  <p className="text-sm font-bold text-navy mt-1">{selectedReg.parentName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                  <p className="text-sm font-medium text-navy mt-1">{selectedReg.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                  <p className="text-sm font-medium text-navy mt-1">{selectedReg.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Class Level</p>
                  <p className="text-sm font-medium text-navy mt-1">Class {selectedReg.classLevel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">City</p>
                  <p className="text-sm font-medium text-navy mt-1">{selectedReg.city}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">School</p>
                  <p className="text-sm font-medium text-navy mt-1">{selectedReg.school}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
