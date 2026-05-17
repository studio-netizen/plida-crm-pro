import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/test")({
  component: () => (
    <div className="p-6 max-w-3xl">
      <div className="rounded-lg border border-dashed bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">Test preliminari</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sessioni di test e presenze — in arrivo nella Fase 4.</p>
      </div>
    </div>
  ),
});
