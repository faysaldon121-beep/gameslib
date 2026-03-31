'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BlogEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: '',
    isPublished: false,
    isFeatured: false,
    authorName: 'Admin',
  });

  useEffect(() => {
    if (postId) {
      fetch(`/api/admin/blog`)
        .then(res => res.json())
        .then(data => {
          const post = data.find((p: any) => p._id === postId);
          if (post) {
            setFormData({
              ...post,
              tags: post.tags?.join(', ') || '',
              authorName: post.author?.name || 'Admin'
            });
          }
        });
    }
  }, [postId]);

  // Corrected handleChange function
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      const { value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateSlug = () => {
    const slug = formData.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      author: { name: formData.authorName }
    };

    const url = postId ? `/api/admin/blog/${postId}` : '/api/admin/blog';
    const method = postId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/blog');
      } else {
        alert('Failed to save post');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{postId ? 'Edit Post' : 'Create New Post'}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} 
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Slug <button type="button" onClick={generateSlug} className="text-purple-400 text-xs ml-2 hover:underline">(Auto-generate)</button>
              </label>
              <input type="text" name="slug" required value={formData.slug} onChange={handleChange} 
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Excerpt</label>
            <textarea name="excerpt" rows={2} required value={formData.excerpt} onChange={handleChange} 
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Featured Image URL</label>
            <input type="text" name="featuredImage" required value={formData.featuredImage} onChange={handleChange} 
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
              <input type="text" name="category" required value={formData.category} onChange={handleChange} placeholder="e.g. Reviews"
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="pc, rpg, guide"
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300 flex justify-between">
              <span>Markdown Content</span>
              <span className="text-xs text-gray-400">Supports standard markdown and HTML</span>
            </label>
            <textarea name="content" rows={15} required value={formData.content} onChange={handleChange} 
              className="w-full bg-gray-700 border border-gray-600 rounded p-4 text-white font-mono text-sm focus:outline-none focus:border-purple-500" />
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-5 h-5 accent-purple-600" />
              <span>Publish Post</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 accent-purple-600" />
              <span>Feature Post</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => router.push('/admin/blog')} className="px-6 py-2 rounded font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
