// src/components/SectionTabs.tsx
type Section = "objects" | "entities" | "ownership" | "result";

type Props = {
  value: Section;                    // current tab
  onChange: (s: Section) => void;    // setSection
};

export default function SectionTabs({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button
        className="btn"
        style={{ background: value === "objects" ? "var(--brand)" : "#64748b" }}
        onClick={() => onChange("objects")}
      >
        Objects
      </button>
      <button
        className="btn"
        style={{ background: value === "entities" ? "var(--brand)" : "#64748b" }}
        onClick={() => onChange("entities")}
      >
        Entities
      </button>
      <button
        className="btn"
        style={{ background: value === "ownership" ? "var(--brand)" : "#64748b" }}
        onClick={() => onChange("ownership")}
      >
        Ownership
      </button>
      <button
        className="btn"
        style={{ background: value === "result" ? "var(--brand)" : "#64748b" }}
        onClick={() => onChange("result")}
      >
        Result
    </button>
    </div>
  );
}
