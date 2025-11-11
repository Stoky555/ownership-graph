// src/components/SectionTabs.tsx
type Section = "objects" | "entities" | "ownership" | "result";

type Props = {
  value: Section;                    // current tab
  onChange: (s: Section) => void;    // setSection
};

export default function SectionTabs({ value, onChange }: Props) {
  const tab = (k: Section, label: string) => (
    <button
      className={`tab ${value === k ? "is-active" : ""}`}
      onClick={() => onChange(k)}
    >
      {label}
    </button>
  );

  return (
    <div className="tabs-bar">
      {tab("objects", "Objects")}
      {tab("entities", "Entities")}
      {tab("ownership", "Ownership")}
      {tab("result", "Result")}
    </div>
  );
}
