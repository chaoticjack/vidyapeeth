import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Search, Eye, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight, CheckSquare, Settings } from "lucide-react";
import { toast } from "sonner";
import { Blog } from "@/lib/firestore";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export const Route = createFileRoute("/admin/blogs/")({
  head: () => ({ meta: [{ title: "Blog CMS — Admin Portal" }] }),
  component: BlogDashboard,
});

function BlogDashboard() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, title_asc, title_desc

  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      setBlogs(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load blogs");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(blogs.map(b => b.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [blogs]);

  const filteredAndSortedBlogs = useMemo(() => {
    let result = [...blogs];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(lowerTerm) || 
        (typeof b.author === 'string' ? b.author.toLowerCase().includes(lowerTerm) : b.author?.name?.toLowerCase().includes(lowerTerm))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(b => b.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter(b => b.category === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (sortBy === "title_desc") return b.title.localeCompare(a.title);
      
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      
      if (sortBy === "oldest") return timeA - timeB;
      return timeB - timeA; // newest
    });

    return result;
  }, [blogs, searchTerm, statusFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBlogs.length / itemsPerPage));
  const paginatedBlogs = filteredAndSortedBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedBlogs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBlogs.map(b => b.id)));
    }
  };

  const getAuthorName = (author: any) => {
    if (typeof author === 'string') return author;
    return author?.name || 'Unknown';
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsBulkDelete(false);
    setIsConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      if (isBulkDelete) {
        selectedIds.forEach(id => {
          batch.delete(doc(db, "blogs", id));
        });
        await batch.commit();
        toast.success(`${selectedIds.size} blogs deleted successfully`);
        setSelectedIds(new Set());
      } else if (deletingId) {
        batch.delete(doc(db, "blogs", deletingId));
        await batch.commit();
        toast.success("Blog deleted successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog(s)");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const executeBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        const updateData: any = { status: newStatus };
        if (newStatus === "published") {
          updateData.published = true;
          // Note: ideally we'd set publishedAt to serverTimestamp() here if it wasn't already set, but we can keep it simple.
        } else {
          updateData.published = false;
        }
        batch.update(doc(db, "blogs", id), updateData);
      });
      await batch.commit();
      toast.success(`${selectedIds.size} blogs updated to ${newStatus}`);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update status`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Professional publishing dashboard for the Vidyapeeth blog.</p>
        </div>
        <Link 
          to="/admin/blogs/editor" 
          className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-saffron transition-colors shadow-sm"
        >
          <Plus size={18} /> Create Article
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-navy/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search articles or authors..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-saffron focus:bg-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm outline-none focus:border-saffron focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm outline-none focus:border-saffron focus:bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 bg-saffron/10 px-3 py-1.5 rounded-lg border border-saffron/20 animate-in fade-in slide-in-from-right-4">
                <span className="text-xs font-bold text-saffron mr-2">{selectedIds.size} selected</span>
                <button onClick={() => executeBulkStatusUpdate("published")} className="text-xs font-semibold text-navy bg-white px-2 py-1 rounded shadow-sm hover:text-saffron">Publish</button>
                <button onClick={() => executeBulkStatusUpdate("archived")} className="text-xs font-semibold text-navy bg-white px-2 py-1 rounded shadow-sm hover:text-saffron">Archive</button>
                <button onClick={confirmBulkDelete} className="text-xs font-semibold text-red-600 bg-white px-2 py-1 rounded shadow-sm hover:bg-red-50">Delete</button>
              </div>
            )}
            
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm outline-none focus:border-saffron"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={paginatedBlogs.length > 0 && selectedIds.size === paginatedBlogs.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-saffron focus:ring-saffron"
                  />
                </th>
                <th className="px-4 py-4">Article</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Author</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Stats</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="mb-2 h-8 w-8 animate-spin text-saffron" />
                      <span>Loading CMS...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-48 text-center text-gray-500">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((row) => (
                  <tr key={row.id} className={`transition-colors hover:bg-gray-50/50 ${selectedIds.has(row.id) ? 'bg-saffron/5' : ''}`}>
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelection(row.id)}
                        className="rounded border-gray-300 text-saffron focus:ring-saffron"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 shrink-0 rounded bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                          {row.featuredImage ? (
                            <img src={row.featuredImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-navy line-clamp-1">{row.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {row.category && <span className="text-[10px] uppercase font-bold text-saffron bg-saffron/10 px-1.5 py-0.5 rounded">{row.category}</span>}
                            <span className="text-xs text-gray-400 truncate max-w-[150px]">/{row.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${
                        row.status === 'published' ? 'bg-green-100 text-green-700' : 
                        row.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        row.status === 'archived' ? 'bg-gray-200 text-gray-600' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold">
                      {getAuthorName(row.author)}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-navy">{row.publishedAt?.toDate ? row.publishedAt.toDate().toLocaleDateString() : '—'}</span>
                        <span className="text-gray-400 text-[10px]">Updated: {row.updatedAt?.toDate ? row.updatedAt.toDate().toLocaleDateString() : '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      <div>{row.readingTime || '5 min read'}</div>
                      <div>0 views</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {row.status === 'published' && (
                          <a href={`/blog/${row.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-navy hover:bg-navy/10 rounded-md transition-colors" title="View live">
                            <Eye size={16} />
                          </a>
                        )}
                        <Link to={`/admin/blogs/editor`} search={{ id: row.id }} className="p-1.5 text-navy hover:bg-navy/10 rounded-md transition-colors" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredAndSortedBlogs.length > 0 && (
          <div className="flex items-center justify-between border-t border-navy/5 px-6 py-4 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-navy">{Math.min(filteredAndSortedBlogs.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-semibold text-navy">{Math.min(filteredAndSortedBlogs.length, currentPage * itemsPerPage)}</span> of <span className="font-semibold text-navy">{filteredAndSortedBlogs.length}</span> articles
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-navy">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={isBulkDelete ? "Delete Multiple Articles" : "Delete Article"}
        description={isBulkDelete ? `Are you sure you want to delete ${selectedIds.size} articles? This action cannot be undone.` : "Are you sure you want to delete this article? This action cannot be undone."}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
