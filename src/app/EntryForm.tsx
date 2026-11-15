"use client";

import { useActionState, useRef } from "react";
import { saveEntry } from "./actions";

export function EntryForm({ today }: { today: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (p: { error?: string }, f: FormData) => {
    const r = await saveEntry(p, f);
    if (!r.error) ref.current?.reset();
    return r;
  }, {});
  return (
    <form ref={ref} action={action} className="card grid gap-3 p-5">
      <h2 className="font-semibold">Log today&apos;s work</h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <label className="field">
          <span>Date</span>
          <input type="date" name="entry_date" defaultValue={today} max={today} required />
        </label>
        <label className="field">
          <span>Hours</span>
          <input type="number" name="hours" defaultValue={8} min={0} max={24} step={0.5} />
        </label>
      </div>
      <label className="field">
        <span>What did you do?</span>
        <textarea name="activities" rows={3} required placeholder="Configured a switch VLAN, shadowed the network admin…" />
      </label>
      <label className="field">
        <span>Skills learned (optional)</span>
        <input name="skills_learned" placeholder="VLAN tagging, Cisco IOS basics" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn justify-self-start" disabled={pending}>
        {pending ? "Saving…" : "Save entry"}
      </button>
      <p className="text-xs text-stone-400">Saving the same date again updates that day&apos;s entry.</p>
    </form>
  );
}
