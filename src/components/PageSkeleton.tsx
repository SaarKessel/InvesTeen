import React from "react";
import { Loader } from "@/components/easyui/Loader";

/** Route-level loading: skeleton cards + EasyUI loader. */
export default function PageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4" role="status" aria-label="טוען">
      <div className="flex justify-center py-2"><Loader size={28} label="טוען..." /></div>
      <div className="skeleton h-24" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-28" /><div className="skeleton h-28" />
      </div>
      <div className="skeleton h-40" />
    </div>
  );
}
