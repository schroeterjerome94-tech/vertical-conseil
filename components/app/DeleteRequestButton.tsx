"use client";

import { deleteRequest } from "@/app/espace/admin/demandes/actions";

export function DeleteRequestButton({ id }: { id: string }) {
  return (
    <form
      action={deleteRequest.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm("Supprimer cette demande ?")) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-navy hover:border-brand"
      >
        Supprimer
      </button>
    </form>
  );
}
