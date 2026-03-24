import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24">
          <div className="card p-8">Loading...</div>
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
