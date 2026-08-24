"use client";

import { useActionState } from "react";
import { submitLink, type SubmitLinkState } from "@/app/j/[slug]/actions";

const initialState: SubmitLinkState = {};

export function SubmitLinkForm({ slug }: { slug: string }) {
  const action = submitLink.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="row">
        <input
          type="text"
          name="videoUrl"
          placeholder="https://www.youtube.com/watch?v=..."
          autoComplete="off"
          style={{ minWidth: 320 }}
        />
        <button type="submit" disabled={pending}>
          {pending ? "..." : "Adicionar"}
        </button>
      </div>
      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p className="hint-text">{state.success}</p>}
    </form>
  );
}
