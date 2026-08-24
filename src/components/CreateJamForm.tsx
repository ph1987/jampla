"use client";

import { useActionState } from "react";
import { createJam, type CreateJamState } from "@/app/jams/new/actions";

const initialState: CreateJamState = {};

export function CreateJamForm() {
  const [state, formAction, pending] = useActionState(createJam, initialState);

  return (
    <form action={formAction}>
      <table>
        <tbody>
          <tr>
            <td className="field-label">Nome da Jam</td>
            <td>
              <input type="text" name="name" autoComplete="off" />
            </td>
          </tr>
          <tr>
            <td className="field-label">Link da playlist</td>
            <td>
              <input
                type="text"
                name="playlistUrl"
                placeholder="https://www.youtube.com/playlist?list=..."
                autoComplete="off"
              />
            </td>
          </tr>
          <tr>
            <td className="field-label">Máx. links por convidado</td>
            <td>
              <input
                type="text"
                name="maxLinksPerUser"
                defaultValue="5"
                autoComplete="off"
              />
            </td>
          </tr>
          <tr>
            <td className="field-label">Intervalo mínimo (segundos)</td>
            <td>
              <input
                type="text"
                name="minSecondsBetween"
                defaultValue="30"
                autoComplete="off"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="row" style={{ marginTop: 8 }}>
        <label>
          <input type="checkbox" name="allowDuplicates" /> Permitir links repetidos
        </label>
      </div>
      <div className="row">
        <label>
          <input type="checkbox" name="requireApproval" defaultChecked /> Aprovação
          manual antes de entrar na playlist
        </label>
      </div>

      <button type="submit" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? "..." : "Criar Jam"}
      </button>
      {state.error && <p className="error-text">{state.error}</p>}
    </form>
  );
}
