type Totals = Record<string, Record<string, number>>;

function Block({ title, data }: { title: string; data: Totals }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>
        {title}
      </div>
      <pre
        style={{
          margin: 0,
          padding: 12,
          background: "#f9fafb",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          overflowX: "auto",
          fontSize: 13,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function TotalsPanel({ direct, indirect }: { direct: Totals; indirect: Totals }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Block title="Direct totals" data={direct} />
      <Block title="Indirect totals (computed)" data={indirect} />
    </div>
  );
}
