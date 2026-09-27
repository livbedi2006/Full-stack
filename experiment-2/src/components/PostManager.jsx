import React, { useState } from 'react';
import PostForm from './PostForm';
import PostList from './PostList';

/**
 * PostManager Component (Experiment 2)
 * 
 * Hub coordinating post creation, editing, and listing with direct Redux integration.
 */
export default function PostManager() {
  const [editingPost, setEditingPost] = useState(null);

  const handleEditPost = (post) => {
    setEditingPost(post);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  return (
    <div className="post-manager-layout">
      {/* Top Creation / Edit Form */}
      <section className="form-section">
        <PostForm
          editingPost={editingPost}
          onCancelEdit={handleCancelEdit}
        />
      </section>

      {/* Posts Explorer List */}
      <section className="list-section">
        <PostList onEditPost={handleEditPost} />
      </section>
    </div>
  );
}
