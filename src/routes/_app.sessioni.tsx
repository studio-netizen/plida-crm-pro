import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sessioni")({
  component: () => <Placeholder title="Sessioni" desc="Gestione sessioni d'esame — in arrivo nella Fase 2." />,
});

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 max-w-3xl">
      <div className="rounded-lg border border-dashed bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
