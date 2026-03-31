'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Define a safe type for the admin panel
type AdminPost = {
  _id: string;
  title: string;
  isPublished: boolean;
  category: string;
  publishedAt?: string;
};

export default function AdminBlogDashboard() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    setPosts(posts.filter(post => post._id !== id));
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <Link 
            href="/admin/blog/editor" 
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Post
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-750 transition-colors">
                  <td className="p-4 font-medium">{post.title}</td>
                  <td className="p-4 text-gray-400">{post.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${post.isPublished ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    <Link href={`/admin/blog/editor?id=${post._id}`} className="text-blue-400 hover:text-blue-300">
                      <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(post._id)} className="text-red-400 hover:text-red-300">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <div className="p-8 text-center text-gray-400">No blog posts found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
