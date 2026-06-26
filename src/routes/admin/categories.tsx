import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, LayoutGrid, Image as ImageIcon, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Category Management — Admin Portal" }] }),
  component: AdminCategories,
});

const categorySchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  thumbnail: z.string().optional(),
  order: z.coerce.number(),
  themeColor: z.string().optional(),
  icon: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  active: z.boolean(),
});
type CategoryForm = z.infer<typeof categorySchema>;

function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { active: true, order: 0 }
  });

  const titleValue = watch("title");
  useEffect(() => {
    if (!editingId && titleValue) {
      setValue("slug", titleValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldValidate: true });
    }
  }, [titleValue, editingId, setValue]);

  useEffect(() => {
    const q = query(collection(db, "courseCategories"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load categories");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openCreate = () => {
    reset({ title: "", slug: "", description: "", bannerImage: "", thumbnail: "", order: categories.length + 1, themeColor: "#1B2A4A", icon: "", seoTitle: "", seoDescription: "", active: true });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (category: any) => {
    reset({
      title: category.title || category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      bannerImage: category.bannerImage || "",
      thumbnail: category.thumbnail || "",
      order: category.order || category.displayOrder || 0,
      themeColor: category.themeColor || "#1B2A4A",
      icon: category.icon || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      active: category.active ?? category.published ?? true,
    });
    setEditingId(category.id);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const closeEditor = () => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) return;
    }
    setIsEditing(false);
    setEditingId(null);
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "courseCategories", editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success("Category updated successfully");
      } else {
        await addDoc(collection(db, "courseCategories"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Category created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update category" : "Failed to create category");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "courseCategories", deletingId));
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    (c.title || c.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "title", label: "Category Name", render: (row: any) => <span className="font-semibold">{row.title || row.name}</span> },
    { key: "slug", label: "Slug" },
    { key: "order", label: "Display Order" },
    { key: "active", label: "Status", render: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${row.active ?? row.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {row.active ?? row.published ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Edit size={16} /></button>
        <button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 -m-4 sm:-m-6 md:-m-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={closeEditor} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Category' : 'New Category'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="categoryEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Publish Category'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          {/* Sidebar Tabs */}
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
            <div className="space-y-1 sticky top-24">
              <button type="button" onClick={() => setActiveTab("basic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "basic" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <LayoutGrid size={18} /> Basic Info
              </button>
              <button type="button" onClick={() => setActiveTab("media")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "media" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <ImageIcon size={18} /> Media & Design
              </button>
              <button type="button" onClick={() => setActiveTab("seo")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "seo" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Search size={18} /> SEO Settings
              </button>
              <button type="button" onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Settings size={18} /> Visibility
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24">
            <form id="categoryEditorForm" onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
              
              {/* BASIC INFO */}
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Category Title <span className="text-red-500">*</span></label>
                      <input {...register("title")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Class 10 Board Prep" />
                      {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Slug <span className="text-red-500">*</span></label>
                      <input {...register("slug")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. class-10" />
                      {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Description</label>
                    <textarea {...register("description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Detailed description of what this category covers..." />
                  </div>
                </div>
              </div>

              {/* MEDIA & DESIGN */}
              <div className={activeTab === "media" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Media & Design</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Banner Image URL</label>
                    <input {...register("bannerImage")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Thumbnail Image URL</label>
                    <input {...register("thumbnail")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Theme Color (HEX)</label>
                      <div className="flex items-center gap-3">
                        <input type="color" {...register("themeColor")} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
                        <input {...register("themeColor")} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors uppercase" placeholder="#1B2A4A" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Icon (Emoji or URL)</label>
                      <input {...register("icon")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 🎓" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO SETTINGS */}
              <div className={activeTab === "seo" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">SEO Settings</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Meta Title</label>
                    <input {...register("seoTitle")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="SEO optimized title..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Meta Description</label>
                    <textarea {...register("seoDescription")} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Brief summary for search engines..." />
                  </div>
                </div>
              </div>

              {/* SETTINGS */}
              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Visibility & Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Display Order</label>
                      <input type="number" {...register("order")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register("active")} className="w-5 h-5 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Category is Active</span>
                        <span className="text-xs text-gray-500 block mt-0.5">Inactive categories will be hidden from students.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage broad category tracks (e.g. Class 10, JEE).</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
          <Plus size={16} /> New Category
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredCategories} 
        loading={loading}
        searchPlaceholder="Search categories by name or slug..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete Category"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
