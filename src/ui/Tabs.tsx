import { useId } from "react";

type Tab = { key: string; label: string };

type Props = {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
  children: React.ReactNode; // one child per tab, order-matched
};

export default function Tabs({ tabs, value, onChange, children }: Props) {
  const group = useId();
  return (
    <div className="tabs">
      <div className="tabs-bar">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab ${value === t.key ? "is-active" : ""}`}
            onClick={() => onChange(t.key)}
            role="tab"
            aria-selected={value === t.key}
            aria-controls={`${group}-${t.key}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tabs-panels">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={tabs[i].key}
                id={`${group}-${tabs[i].key}`}
                hidden={value !== tabs[i].key}
              >
                {child}
              </div>
            ))
          : children}
      </div>
    </div>
  );
}
