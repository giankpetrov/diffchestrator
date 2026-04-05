import type { HeatmapEntry } from "./DashboardApp";

interface Props {
  entries: HeatmapEntry[];
  onOpenRepo: (path: string) => void;
}

function score(e: HeatmapEntry): number {
  return e.totalChanges * 2 + (e.daysSinceLastCommit ?? 0);
}

type HeatLevel = "hot" | "warm" | "mild" | "stale" | "quiet";

function heatLevel(e: HeatmapEntry): HeatLevel {
  if (e.totalChanges >= 10) return "hot";
  if (e.totalChanges > 0) return "warm";
  if (e.daysSinceLastCommit !== undefined && e.daysSinceLastCommit > 30)
    return "stale";
  if (e.daysSinceLastCommit !== undefined && e.daysSinceLastCommit > 7)
    return "mild";
  return "quiet";
}

export default function ChangeHeatmap({ entries, onOpenRepo }: Props) {
  const sorted = [...entries].sort((a, b) => score(b) - score(a));

  const activeCount = entries.filter((e) => e.totalChanges > 0).length;
  const staleCount = entries.filter(
    (e) => e.daysSinceLastCommit !== undefined && e.daysSinceLastCommit > 30
  ).length;

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        Change Heatmap
        <span className="section-badge">
          {activeCount > 0 && `${activeCount} active `}
          {staleCount > 0 && `${staleCount} stale`}
          {activeCount === 0 && staleCount === 0 && "All quiet"}
        </span>
      </div>
      <div className="dashboard-section-body">
        {entries.length === 0 ? (
          <div className="section-empty">Loading heatmap data...</div>
        ) : (
          <div className="heatmap-grid">
            {sorted.map((e) => (
              <div
                key={e.path}
                className={`heatmap-tile heatmap-tile--${heatLevel(e)}`}
                onClick={() => onOpenRepo(e.path)}
                title={[
                  e.name,
                  `Changes: ${e.totalChanges}`,
                  e.daysSinceLastCommit !== undefined
                    ? `Last commit: ${e.daysSinceLastCommit}d ago`
                    : "No commits",
                ].join("\n")}
              >
                <div className="heatmap-tile-name">{e.name}</div>
                <div className="heatmap-tile-stats">
                  {e.totalChanges > 0 && `${e.totalChanges} changes`}
                  {e.totalChanges > 0 &&
                    e.daysSinceLastCommit !== undefined &&
                    " · "}
                  {e.daysSinceLastCommit !== undefined &&
                    `${e.daysSinceLastCommit}d`}
                  {e.totalChanges === 0 &&
                    e.daysSinceLastCommit === undefined &&
                    "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
