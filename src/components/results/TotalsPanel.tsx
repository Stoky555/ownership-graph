type Totals = Record<string, Record<string, number>>;

function Block({ title, data }: { title: string; data: Totals }) {
  return (
    <div className="panel">
      <div className="px-3 py-2.5 font-bold border-b border-slate-200">{title}</div>
      <pre className="m-0 p-3 bg-slate-50 overflow-x-auto text-[13px]">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default function TotalsPanel({ direct, indirect }: { direct: Totals; indirect: Totals }) {
  return (
    <div className="grid gap-3">
      <Block title="Direct totals" data={direct} />
      <Block title="Indirect totals (computed)" data={indirect} />
    </div>
  );
}
