"use client";

import { useActionState, useState } from "react";
import { createJam, type CreateJamState } from "@/app/jams/new/actions";
import { NO_MAX_LINKS, NO_MIN_INTERVAL } from "@/lib/jamLimits";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: CreateJamState = {};

export function CreateJamForm() {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(createJam, initialState);
  const [createNewPlaylist, setCreateNewPlaylist] = useState(false);

  return (
    <form action={formAction}>
      <table>
        <tbody>
          <tr>
            <td className="field-label">{dict.createJamForm.nameLabel}</td>
            <td>
              <input type="text" name="name" autoComplete="off" />
            </td>
          </tr>
          {!createNewPlaylist && (
            <tr>
              <td className="field-label">{dict.createJamForm.playlistLinkLabel}</td>
              <td>
                <input
                  type="text"
                  name="playlistUrl"
                  placeholder={dict.createJamForm.playlistLinkPlaceholder}
                  autoComplete="off"
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="row">
        <label>
          <input
            type="checkbox"
            name="createNewPlaylist"
            checked={createNewPlaylist}
            onChange={(e) => setCreateNewPlaylist(e.target.checked)}
          />{" "}
          {dict.createJamForm.createNewPlaylistLabel}
        </label>
      </div>
      {/* Limites por convidado desativados por enquanto — valores fixos sem restrição, até remodelar essa parte */}
      <input type="hidden" name="maxLinksPerUser" value={NO_MAX_LINKS} />
      <input type="hidden" name="minSecondsBetween" value={NO_MIN_INTERVAL} />

      <div className="row" style={{ marginTop: 8 }}>
        <label>
          <input type="checkbox" name="allowDuplicates" /> {dict.createJamForm.allowDuplicatesLabel}
        </label>
      </div>
      <div className="row">
        <label>
          <input type="checkbox" name="requireApproval" defaultChecked />{" "}
          {dict.createJamForm.requireApprovalLabel}
        </label>
      </div>

      <button type="submit" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? "..." : dict.createJamForm.submit}
      </button>
      {state.error && <p className="error-text">{state.error}</p>}
    </form>
  );
}
