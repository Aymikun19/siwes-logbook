"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useRef } from "react";
import type { Entry } from "@/lib/types";
import { fmt } from "@/lib/weeks";
import { deleteEntry } from "./actions";
import { EntryForm } from "./EntryForm";

export function EntryActions({ entry, today, locked }: { entry: Entry; today: string; locked: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  if (locked) return null;
  return (
    <div className="flex items-center gap-1">
      <button type="button" className="btn-ghost !p-2" aria-label={`Edit entry for ${fmt(entry.entry_date)}`} onClick={() => dialog.current?.showModal()}>
        <Pencil size={15} aria-hidden />
      </button>
      <form
        action={deleteEntry.bind(null, entry.id)}
        onSubmit={(e) => {
          if (!confirm(`Delete the entry for ${fmt(entry.entry_date)}?`)) e.preventDefault();
        }}
      >
        <button className="btn-ghost !p-2 hover:!bg-red-50 hover:!text-red-600" aria-label={`Delete entry for ${fmt(entry.entry_date)}`}>
          <Trash2 size={15} aria-hidden />
        </button>
      </form>
      <dialog ref={dialog} className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-stone-900/40">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="font-semibold">Edit {fmt(entry.entry_date)}</h2>
          <button type="button" className="btn-ghost !p-2" aria-label="Close" onClick={() => dialog.current?.close()}>
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="p-6">
          <EntryForm today={today} initial={entry} onSaved={() => dialog.current?.close()} />
        </div>
      </dialog>
    </div>
  );
}
