"use client";

import { useEffect, useState } from "react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const fetchRequests = async () => {
    const res = await fetch("/api/admin/requests");
    const data = await res.json();
    setRequests(data.requests || []);
  };
  useEffect(() => { fetchRequests(); }, []);
  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) fetchRequests();
  };
  return (
    <div>
      <h1 className="text-3xl font-bold text-g-text mb-2">Game Requests</h1>
      <p className="text-g-muted mb-8">Review incoming game requests and mark them fulfilled or rejected.</p>
      <div className="space-y-4">
        {requests.map((item) => (
          <div key={item._id} className="card p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-g-text">{item.gameName}</h2>
                <p className="text-sm text-g-muted mt-1">{item.userEmail}</p>
                <p className="text-sm text-g-muted mt-3 whitespace-pre-wrap">{item.message || "No extra message provided."}</p>
                <div className="text-xs text-g-muted mt-3">Status: {item.status}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => updateStatus(item._id, "Fulfilled")}>Fulfilled</button>
                <button className="btn-secondary border-g-red text-g-red" onClick={() => updateStatus(item._id, "Rejected")}>Reject</button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && <div className="card p-5 text-g-muted">No requests found.</div>}
      </div>
    </div>
  );
}
