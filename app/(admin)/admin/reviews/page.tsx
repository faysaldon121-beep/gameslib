"use client";

import { useEffect, useState } from "react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const fetchReviews = async () => {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
  };
  useEffect(() => { fetchReviews(); }, []);
  const moderate = async (id: string, action: "approve" | "delete") => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: action === "approve" ? "PATCH" : "DELETE" });
    if (res.ok) fetchReviews();
  };
  return (
    <div>
      <h1 className="text-3xl font-bold text-g-text mb-2">Review Moderation</h1>
      <p className="text-g-muted mb-8">Approve reviews to publish fresh UGC and update rating schema.</p>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="card p-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-g-text">{review.title}</div>
                  <div className="text-sm text-g-muted">{review.gameSlug} · {review.userName} · {review.rating}/5</div>
                </div>
                <div className="text-xs text-g-muted">{review.isApproved ? "Approved" : "Pending"}</div>
              </div>
              <p className="text-sm text-g-muted whitespace-pre-wrap">{review.body}</p>
              <div className="flex gap-2">
                {!review.isApproved && <button className="btn-secondary" onClick={() => moderate(review._id, "approve")}>Approve</button>}
                <button className="btn-secondary border-g-red text-g-red" onClick={() => moderate(review._id, "delete")}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="card p-5 text-g-muted">No reviews pending.</div>}
      </div>
    </div>
  );
}
