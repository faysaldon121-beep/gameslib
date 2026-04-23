'use client';

import { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const[success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-xl text-white">
      <div className="flex items-center gap-2 mb-3">
        <EnvelopeIcon className="w-6 h-6" />
        <h3 className="text-xl font-black">Daily Gaming News</h3>
      </div>
      
      <p className="text-purple-100 mb-4 text-sm">
        Get breaking news delivered to your inbox every morning
      </p>

      {success ? (
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-3">
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">Successfully subscribed!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
          />
          
          {error && (
            <p className="text-red-300 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe Now'}
          </button>
        </form>
      )}

      <p className="text-xs text-purple-200 mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
