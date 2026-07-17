"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

type ImportedUser = {
  id: number;
  name: string;
  waNumber: string;
  defaultPassword: string;
};

export function ImportPasswordSheet({
  users,
  onClose,
}: {
  users: ImportedUser[];
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function copyAll() {
    const text = users
      .map((u) => `${u.name}\t${u.waNumber}\t${u.defaultPassword}`)
      .join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedId(-1);
    window.setTimeout(() => setCopiedId(null), 1500);
  }

  function copyOne(u: ImportedUser) {
    navigator.clipboard?.writeText(u.defaultPassword);
    setCopiedId(u.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-password-title"
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-on-background/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <Icon name="vpn_key" filled className="text-[22px]" />
            </div>
            <div>
              <h3
                id="import-password-title"
                className="font-headline-sm text-headline-sm text-on-surface"
              >
                Default Password
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {users.length} user berhasil diimpor. Salin password bagikan ke
                masing-masing user.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-auto p-4 flex flex-col gap-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg font-label-sm text-label-sm bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors"
            >
              <Icon name="content_copy" className="text-[16px]" />
              {copiedId === -1 ? "Disalin!" : "Salin Semua"}
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-label-sm text-label-sm">Nama</th>
                  <th className="px-3 py-2 font-label-sm text-label-sm">
                    WhatsApp
                  </th>
                  <th className="px-3 py-2 font-label-sm text-label-sm">
                    Password
                  </th>
                  <th className="px-3 py-2 font-label-sm text-label-sm text-right">
                    Salin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface">
                      {u.name}
                    </td>
                    <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
                      {u.waNumber}
                    </td>
                    <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface font-mono">
                      {u.defaultPassword}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => copyOne(u)}
                        aria-label={`Salin password ${u.name}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-primary hover:bg-primary-container transition-colors"
                      >
                        <Icon
                          name={copiedId === u.id ? "check" : "content_copy"}
                          className="text-[16px]"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
