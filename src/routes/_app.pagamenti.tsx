import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/pagamenti")({
  component: () => (
    <div className="p-6 max-w-3xl">
      <div className="rounded-lg border border-dashed bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">Pagamenti</h2>
        <p className="mt-2 text-sm text-muted-foreground">Registrazione e verifica pagamenti — in arrivo nella Fase 3.</p>
      </div>
    </div>
  ),
});
