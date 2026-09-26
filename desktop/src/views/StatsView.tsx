import {
  Activity,
  Code2,
  Flame,
  GitCommitHorizontal,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GlideSelect, RubberSegment } from "../components/InteractiveControls";
import { api, native } from "../api";
import type { StatsSnapshot, WorkSession } from "../types";
import type { WorkspaceController } from "../useWorkspace";

const day = 86_400;
const empty: StatsSnapshot = { sessions: [], commits: [] };
const dayKey = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString("en-CA");
const duration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hours
    ? `${hours}h ${minutes}m ${secs}s`
    : minutes
      ? `${minutes}m ${secs}s`
      : `${secs}s`;
};
const sessionSeconds = (session: WorkSession, now: number, cutoff: number) =>
  Math.max(
    0,
    Math.min(session.endedAt ?? now, now) - Math.max(session.startedAt, cutoff),
  );

export function StatsView({ model }: { model: WorkspaceController }) {
  const { workspace } = model;
  const [stats, setStats] = useState<StatsSnapshot>(empty);
  const [loadError, setLoadError] = useState("");
  const [range, setRange] = useState("30");
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const tick = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => window.clearInterval(tick);
  }, []);
  useEffect(() => {
    if (!native) return;
    let stopped = false;
    const load = () =>
      void api
        .stats()
        .then((next) => {
          if (!stopped) { setStats(next); setLoadError(""); }
        })
        .catch(() => { if (!stopped) setLoadError("Statistics could not be refreshed. Your saved history is unchanged. Retrying shortly."); });
    load();
    const refresh = window.setInterval(load, 10_000);
    return () => {
      stopped = true;
      window.clearInterval(refresh);
    };
  }, []);
  const years = useMemo(() => {
    const values = new Set<number>([new Date().getFullYear()]);
    stats.sessions.forEach((item) =>
      values.add(new Date(item.startedAt * 1000).getFullYear()),
    );
    stats.commits.forEach((item) =>
      values.add(new Date(item.at * 1000).getFullYear()),
    );
    return [...values].sort((a, b) => b - a);
  }, [stats]);
  const period = useMemo(() => {
    if (range.startsWith("year:")) {
      const year = Number(range.slice(5));
      return {
        start: Math.floor(new Date(year, 0, 1).getTime() / 1000),
        end: Math.min(now, Math.floor(new Date(year + 1, 0, 1).getTime() / 1000)),
      };
    }
    return { start: now - Number(range) * day, end: now };
  }, [range, now]);
  const filtered = stats.sessions.filter(
    (item) =>
      item.startedAt < period.end && (item.endedAt ?? now) >= period.start,
  );
  const commits = stats.commits.filter(
    (item) => item.at >= period.start && item.at < period.end,
  );
  const totalSeconds = filtered.reduce(
    (sum, item) =>
      sum + sessionSeconds(item, Math.min(now, period.end), period.start),
    0,
  );
  const active = stats.sessions.filter((item) => item.endedAt == null);
  const projectName = (path: string | null) =>
    path
      ? (workspace.projects.find((project) => project.path === path)?.name ??
        path)
      : "General work";
  const projectTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filtered.forEach((item) => {
      const key = item.projectPath ?? "";
      totals.set(
        key,
        (totals.get(key) ?? 0) +
          sessionSeconds(item, Math.min(now, period.end), period.start),
      );
    });
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered, now, period]);
  const appTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filtered.forEach((item) =>
      totals.set(
        item.appName,
        (totals.get(item.appName) ?? 0) +
          sessionSeconds(item, Math.min(now, period.end), period.start),
      ),
    );
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered, now, period]);
  const calendar = useMemo(() => {
    const requestedStart = range.startsWith("year:")
      ? period.start
      : range === "7" ? now - 6 * day : range === "30" ? now - 29 * day : Math.max(period.start, now - 364 * day);
    const startDate = new Date(requestedStart * 1000);
    startDate.setHours(0, 0, 0, 0);
    if (range === "365" || range.startsWith("year:")) startDate.setDate(startDate.getDate() - startDate.getDay());
    const start = Math.floor(startDate.getTime() / 1000);
    const dates: Date[] = [];
    const cursor = new Date(startDate);
    while (cursor.getTime() / 1000 < period.end && dates.length < 372) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    const usage = new Map<string, number>();
    filtered.forEach((item) => {
      const cursor = new Date(Math.max(item.startedAt, start) * 1000);
      cursor.setHours(0, 0, 0, 0);
      const end = Math.min(item.endedAt ?? now, period.end);
      while (cursor.getTime() / 1000 < end) {
        const key = cursor.toLocaleDateString("en-CA");
        const dayStart = Math.floor(cursor.getTime() / 1000);
        const nextDay = new Date(cursor);
        nextDay.setDate(nextDay.getDate() + 1);
        usage.set(
          key,
          (usage.get(key) ?? 0) +
            Math.max(
              0,
              Math.min(end, nextDay.getTime() / 1000) -
                Math.max(item.startedAt, dayStart),
            ),
        );
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    const commitDays = new Map<string, number>();
    commits.forEach((item) => {
      const key = dayKey(item.at);
      commitDays.set(key, (commitDays.get(key) ?? 0) + 1);
    });
    return dates.map((date) => {
      const key = date.toLocaleDateString("en-CA");
      const seconds = usage.get(key) ?? 0;
      const commitCount = commitDays.get(key) ?? 0;
      const level = Math.min(4, Math.ceil(seconds / 3600 + commitCount / 2));
      return { key, seconds, commits: commitCount, level };
    });
  }, [range, period, filtered, commits, now]);
  const activeDays = new Set(
    filtered.map((session) => dayKey(session.startedAt)),
  ).size;
  const maxProject = projectTotals[0]?.[1] || 1;
  const maxApp = appTotals[0]?.[1] || 1;

  return (
    <>
      <div className="page-heading stats-heading">
        <div>
          <p className="eyebrow">YOUR WORK RHYTHM</p>
          <h1>Usage & statistics</h1>
          <p>
            Local activity measured from applications launched through doaorel.
          </p>
        </div>
        <div className="stats-range" aria-label="Statistics period">
          <RubberSegment items={["Week", "30 days", "365 days", "Year"]} value={range.startsWith("year:") ? "Year" : range === "7" ? "Week" : range === "30" ? "30 days" : "365 days"} onChange={(value) => setRange(value === "Week" ? "7" : value === "30 days" ? "30" : value === "365 days" ? "365" : `year:${new Date().getFullYear()}`)} ariaLabel="Statistics period" size="sm" radius={9} inset={3} draggable={false} trackColor="#171820" thumbColor="#383a4a" textColor="var(--muted)" activeTextColor="var(--text)" />
          {range.startsWith("year:") && <GlideSelect ariaLabel="Statistics year" value={range.slice(5)} options={years.map((year) => ({ value: String(year), label: String(year) }))} onChange={(value) => setRange(`year:${value}`)} menuWidth={120} showTags={false} />}
        </div>
      </div>

      {active.length > 0 && (
        <section className="live-work-card">
          <span className="live-pulse" />
          <div>
            <span className="eyebrow">WORKING NOW</span>
            <strong>{projectName(active[0].projectPath)}</strong>
            <small>{active[0].appName}</small>
          </div>
          <time>{duration(now - active[0].startedAt)}</time>
        </section>
      )}

      {loadError && <p className="warning" role="alert">{loadError}</p>}
      <p className="muted small">Application-open time, not keyboard-active time. Concurrent sessions may overlap. Commit counts include all authors in tracked repositories.</p>
      <AnimatePresence mode="wait" initial={false}>
      <motion.div className="stats-period-content" key={range} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.19, ease: [0.22, 1, 0.36, 1] }}>
      <div className="stats-summary">
        <article>
          <Timer size={19} />
          <span>Tracked application time</span>
          <strong>{duration(totalSeconds)}</strong>
        </article>
        <article>
          <Flame size={19} />
          <span>Active days</span>
          <strong>{activeDays}</strong>
        </article>
        <article>
          <GitCommitHorizontal size={19} />
          <span>Git commits</span>
          <strong>{commits.length}</strong>
        </article>
        <article>
          <Activity size={19} />
          <span>Work sessions</span>
          <strong>{filtered.length}</strong>
        </article>
      </div>

      <section className="stats-section contribution-card">
        <div className="section-heading">
          <div>
            <h2>Contribution activity</h2>
            <p className="muted small">
              Time and local Git commits, day by day.
            </p>
          </div>
          <span className="muted small">Less&nbsp; ▫ ▪ ▪ ▪ &nbsp;More</span>
        </div>
        <div className="contribution-scroll">
          <div className={`contribution-grid ${range === "7" ? "week-grid" : range === "30" ? "month-grid" : "year-grid"}`} style={{ "--calendar-cols": Math.ceil(calendar.length / (range === "7" ? 1 : range === "30" ? 3 : 7)), "--calendar-rows": range === "7" ? 1 : range === "30" ? 3 : 7 } as CSSProperties}>
            {calendar.map((item) => (
              <span
                key={item.key}
                data-level={item.level}
                title={`${item.key} · ${duration(item.seconds)} · ${item.commits} commits`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="stats-breakdown">
        <Breakdown
          icon={<Code2 size={17} />}
          title="By project"
          rows={projectTotals.map(([path, seconds]) => ({
            label: projectName(path || null),
            seconds,
          }))}
          maximum={maxProject}
        />
        <Breakdown
          icon={<Timer size={17} />}
          title="By application"
          rows={appTotals.map(([label, seconds]) => ({ label, seconds }))}
          maximum={maxApp}
        />
      </div>
      </motion.div>
      </AnimatePresence>
      {!stats.sessions.length && (
        <p className="muted stats-empty">
          Open a project in its preferred IDE—or launch any tracked application
          from Tools—to begin your first permanent work session.
        </p>
      )}
    </>
  );
}

function Breakdown({
  icon,
  title,
  rows,
  maximum,
}: {
  icon: ReactNode;
  title: string;
  rows: { label: string; seconds: number }[];
  maximum: number;
}) {
  return (
    <section className="stats-section breakdown-card">
      <h2>
        {icon}
        {title}
      </h2>
      {rows.slice(0, 7).map((row) => (
        <div className="breakdown-row" key={row.label}>
          <span>{row.label}</span>
          <strong>{duration(row.seconds)}</strong>
          <i
            style={{ width: `${Math.max(4, (row.seconds / maximum) * 100)}%` }}
          />
        </div>
      ))}
      {!rows.length && (
        <p className="muted small">No tracked time in this period.</p>
      )}
    </section>
  );
}
