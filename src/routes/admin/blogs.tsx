import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/blogs")({
  head: () => ({ meta: [{ title: "Blog Management — Admin Portal" }] }),
  component: AdminBlogs,
});

const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  author: z.string().min(2, "Author is required"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  tags: z.string(),
  status: z.enum(["draft", "published"]),
  featuredImage: z.string().optional(),
});
type BlogForm = z.infer<typeof blogSchema>;

function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: { status: "draft" }
  });

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlogs(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load blogs");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openCreateModal = () => {
    reset({ title: "", slug: "", author: "", content: "", tags: "", status: "draft", featuredImage: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    reset({
      title: blog.title,
      slug: blog.slug,
      author: blog.author,
      content: blog.content,
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
      status: blog.status,
      featuredImage: blog.featuredImage || "",
    });
    setEditingId(blog.id);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: BlogForm) => {
    try {
      const tagsArray = data.tags.split(",").map(t => t.trim()).filter(Boolean);
      const isPublished = data.status === "published";
      const payload: any = { 
        ...data, 
        tags: tagsArray,
        published: isPublished 
      };

      if (editingId) {
        if (isPublished) payload.publishedAt = serverTimestamp();
        await updateDoc(doc(db, "blogs", editingId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast.success("Blog updated successfully");
      } else {
        if (isPublished) payload.publishedAt = serverTimestamp();
        await addDoc(collection(db, "blogs"), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Blog created successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update blog" : "Failed to create blog");
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
      await deleteDoc(doc(db, "blogs", deletingId));
      toast.success("Blog deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  // Filter blogs
  const filteredBlogs = blogs.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "title", label: "Title", render: (row: any) => <span className="font-semibold">{row.title}</span> },
    { key: "author", label: "Author" },
    { key: "status", label: "Status", render: (row: any) => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {row.status}
      </span>
    )},
    { key: "createdAt", label: "Date", render: (row: any) => (
      <span className="text-gray-500 text-xs">
        {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'Just now'}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEditModal(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Edit size={16} /></button>
        <button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage content for the Vidyapeeth blog.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
          <Plus size={16} /> New Post
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredBlogs} 
        loading={loading}
        searchPlaceholder="Search blogs by title or author..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete Post"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="blogForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Title</label>
                    <input {...register("title")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="Post title" />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Slug</label>
                    <input {...register("slug")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="URL slug (e.g. top-tips-2026)" />
                    {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Author</label>
                    <input {...register("author")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="Author name" />
                    {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Status</label>
                    <select {...register("status")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm bg-white">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Featured Image URL</label>
                  <input {...register("featuredImage")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="https://..." />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Tags (comma separated)</label>
                  <input {...register("tags")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="math, physics, exam tips" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Content (Markdown supported)</label>
                  <textarea {...register("content")} rows={8} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" placeholder="Write your post here..." />
                  {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="blogForm" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
