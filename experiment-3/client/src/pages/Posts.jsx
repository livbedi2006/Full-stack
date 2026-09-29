import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPostsApi, createPostApi, updatePostApi, deletePostApi } from "../services/api";

const STATUSES = ["published", "draft", "archived"];

function StatusBadge({ status }) {
  const cls = { published: "badge badge-success", draft: "badge badge-warning", archived: "badge badge-neutral" }[status] || "badge badge-neutral";
  return <span className={cls}>{status.toUpperCase()}</span>;
}

function PostModal({ post, onClose, onSave }) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState(post?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(post);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { setError("Title and Content are required."); return; }
    setSaving(true); setError("");
    try {
      const result = isEdit ? await updatePostApi(post.id, { title, content, status }) : await createPostApi({ title, content, status });
      if (result.ok) { onSave(result.data.post || result.data); }
      else { setError(result.data?.message || "Save failed."); }
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? "Edit Post" : "Create New Post"}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">X</button>
        </div>
        {error && <div className="alert-banner alert-danger">{error}</div>}
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">Title <span className="required-star">*</span></label>
            <input id="post-title" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="post-content">Content <span className="required-star">*</span></label>
            <textarea id="post-content" className="form-input form-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Write your content here..." rows={4} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="post-status">Status</label>
            <select id="post-status" className="form-input form-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-sm" /> Saving...</> : (isEdit ? "Update Post" : "Create Post")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Posts() {
  const { can, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    const result = await fetchPostsApi();
    if (result.ok) { setPosts(result.data.posts || []); }
    else { setError(result.data?.message || "Failed to load posts."); }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleSave = (savedPost) => {
    if (modal?.post) { setPosts(prev => prev.map(p => p.id === savedPost.id ? savedPost : p)); setActionMsg("Post updated successfully."); }
    else { setPosts(prev => [savedPost, ...prev]); setActionMsg("Post created successfully."); }
    setModal(null);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleDelete = async (postId) => {
    const result = await deletePostApi(postId);
    if (result.ok) { setPosts(prev => prev.filter(p => p.id !== postId)); setActionMsg("Post deleted."); }
    else { setActionMsg(result.data?.message || "Delete failed — backend returned 403 Forbidden."); }
    setDeleteConfirm(null);
    setTimeout(() => setActionMsg(""), 4000);
  };

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.author || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge exp3-badge">RBAC MODULE</span>
            <span className="badge badge-info">POSTS MANAGEMENT</span>
          </div>
          <h1 className="page-title">Posts Management</h1>
          <p className="page-subtitle">Actions rendered conditionally based on your role: <strong>{user?.role?.toUpperCase()}</strong></p>
        </div>
        {can("create_post") && (
          <button className="btn btn-primary" onClick={() => setModal("create")}>+ Create Post</button>
        )}
      </div>

      <div className="rbac-info-strip">
        <span className={`perm-chip ${can("create_post") ? "perm-allowed" : "perm-denied"}`}>{can("create_post") ? "✓" : "✗"} Create</span>
        <span className={`perm-chip ${can("edit_post") ? "perm-allowed" : "perm-denied"}`}>{can("edit_post") ? "✓" : "✗"} Edit</span>
        <span className={`perm-chip ${can("delete_post") ? "perm-allowed" : "perm-denied"}`}>{can("delete_post") ? "✓" : "✗"} Delete</span>
      </div>

      {actionMsg && <div className="alert-banner alert-success">{actionMsg}</div>}

      <div className="filter-bar">
        <input className="form-input search-input" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input form-select filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner-lg" /><p>Loading posts...</p></div>
      ) : error ? (
        <div className="alert-banner alert-danger">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No posts found.</p>
          {can("create_post") && <button className="btn btn-primary" onClick={() => setModal("create")}>Create First Post</button>}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Author</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id}>
                  <td>
                    <div className="post-title-cell">
                      <strong>{post.title}</strong>
                      <span className="post-content-preview">{(post.content || "").slice(0, 70)}...</span>
                    </div>
                  </td>
                  <td><span className="author-chip">{post.author}</span></td>
                  <td><StatusBadge status={post.status} /></td>
                  <td className="date-cell">{post.date || post.createdAt || "—"}</td>
                  <td>
                    <div className="action-buttons">
                      {!can("edit_post") && !can("delete_post") && <span className="btn btn-sm btn-secondary">View</span>}
                      {can("edit_post") && <button className="btn btn-sm btn-secondary" onClick={() => setModal({ post })}>Edit</button>}
                      {can("delete_post") && <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(post)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <PostModal post={modal?.post || null} onClose={() => setModal(null)} onSave={handleSave} />}

      {deleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card-sm">
            <div className="modal-header"><h3 className="modal-title">Confirm Delete</h3></div>
            <div className="modal-body">
              <p>Delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.</p>
              <p className="text-muted text-sm">Backend enforces authorization — returns HTTP 403 if your role lacks delete_post permission.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
