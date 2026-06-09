import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MouseEvent } from "react";

export interface Tab {
  k: string;
  num: string;
  label: string;
  done: boolean;
}

// The sticky stage switcher: a row of step tabs plus the global actions
// (auto-pick, reset, theme toggle). Rendered inside the parent <Tabs>.
export function Nav({
  tabs,
  stage,
  themeLabel,
  onAutoPick,
  onReset,
  onToggleTheme,
}: {
  tabs: Tab[];
  stage: string;
  themeLabel: string;
  onAutoPick: () => void;
  onReset: () => void;
  onToggleTheme: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <nav className="bar">
      <TabsList className="tabs">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.k}
            value={t.k}
            className={`tab${stage === t.k ? " active" : ""}${t.done ? " done" : ""}`}
          >
            <span className="n">{t.done ? "✓" : t.num}</span>
            <span className="lbl">{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="actions">
        <Button variant="mag" size="sm" onClick={onAutoPick}>
          ⚡ Auto-pick by ranking
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleTheme}>
          {themeLabel}
        </Button>
      </div>
    </nav>
  );
}
