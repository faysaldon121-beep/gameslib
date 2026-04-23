'use client'; import { useEffect, useRef } from 'react';
export default function NewsViewTracker({ newsId }: { newsId: string }) { const t = useRef(false); useEffect(() => { if(!t.current) { setTimeout(() => fetch('/api/news/view', { method:'POST', body: JSON.stringify({newsId})}), 3000); t.current = true; } }, [newsId]); return null; }
