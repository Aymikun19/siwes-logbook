"use client";

import { useActionState, useRef } from "react";
import { Save } from "lucide-react";
import type { Entry } from "@/lib/types";
import { saveEntry } from "./actions";

export function EntryForm({ today, initial, onSaved }: { today: string; initial?: Entry; onSaved?: () => void }) {
  const ref = useRef<HTMLFormElement>(null);
  type S = { error?: string; ok?: number };
  const [state, action, pending] = useActionState<S, FormData>(async (p, f) => {
    const r = await saveEntry(p, f);
    if (r.error) return { error: r.error };
    if (!initial) ref.current?.reset();
    onSaved?.();
    return { ok: Date.now() };
  }, {});
  return (
    <form ref={ref} action={action} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <label className="field">
          <span>Date</span>
          <input type="date" name="entry_date" defaultValue={initial?.entry_date ?? today} max={today} required readOnly={!!initial} />
        </label>
        <label className="field">
          <span>Hours</span>
          <input type="number" name="hours" defaultValue={initial?.hours ?? 8} min={0} max={24} step={0.5} />
        </label>
      </div>
      <label className="field">
        <span>What did you do?</span>
        <textarea
          name="activities"
          rows={4}
          required
          defaultValue={initial?.activities}
          placeholder="Configured a switch VLAN, shadowed the network admin…"
        />
      </label>
      <label className="field">
        <span>Skills learned</span>
        <input name="skills_learned" defaultValue={initial?.skills_learned ?? ""} placeholder="VLAN tagging, Cisco IOS basics (separate with commas)" />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" disabled={pending}>
          <Save size={16} aria-hidden /> {pending ? "Saving…" : initial ? "Save changes" : "Save entry"}
        </button>
        {state.ok && !initial && <p role="status" className="text-sm text-emerald-700">Saved.</p>}
        {!initial && <p className="text-xs text-stone-500">Saving the same date again updates that day.</p>}
      </div>
    </form>
  );
}
