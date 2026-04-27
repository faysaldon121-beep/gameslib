'use client';

import { useState, FormEvent } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-6 rounded-xl border border-purple-500/30">
      <div className="flex items-center gap-2 mb-3">
        <EnvelopeIcon className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-black text-white">Newsletter</h3>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">
        Get the latest gaming news delivered to your inbox every week!
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 p-4 bg-green-600/20 border border-green-500/50 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
          <span className="text-green-300 text-sm font-semibold">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2.5 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
          {status === 'error' && (
            <p className="text-red-400 text-xs">{message}</p>
          )}
        </form>
      )}

      <p className="text-gray-500 text-xs mt-3">
        No spam, unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
}
