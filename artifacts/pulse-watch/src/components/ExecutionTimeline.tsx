import React, { useState, useMemo } from "react";
import { useListExecutions, getListExecutionsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Calendar, Clock, Activity } from "lucide-react";
import { ExecutionDetailModal } from "./ExecutionDetailModal";
import { cn } from "@/lib/utils";

type Execution = {
  id: number;
  startedAt: string;
  totalApis: number;
  passed: number;
  failed: number;
  avgResponseTime: number;
};

type DrillLevel = "year" | "month" | "day" | "hour" | "executions";

type Breadcrumb = { level: DrillLevel; label: string };

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function groupBy<T>(items: T[], key: (item: T) => string | number): Record<string | number, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string | number, T[]>);
}

function passFail(execs: Execution[]) {
  const passed = execs.reduce((s, e) => s + e.passed, 0);
  const failed = execs.reduce((s, e) => s + e.failed, 0);
  return { passed, failed };
}

function DrillCard({
  label,
  sublabel,
  passed,
  failed,
  count,
  onClick,
}: {
  label: string;
  sublabel?: string;
  passed: number;
  failed: number;
  count: number;
  onClick: () => void;
}) {
  const allPassed = failed === 0;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-5 py-4 rounded-lg border transition-all text-left",
        "hover:border-primary/50 hover:bg-muted/50 group"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-2 h-10 rounded-full shrink-0",
          allPassed ? "bg-green-500" : failed > 0 && passed === 0 ? "bg-red-500" : "bg-orange-400"
        )} />
        <div>
          <div className="font-semibold text-base">{label}</div>
          {sublabel && <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-green-500 font-medium">{passed} passed</span>
            {failed > 0 && <span className="text-xs text-red-500 font-medium">{failed} failed</span>}
            <span className="text-xs text-muted-foreground">{count} run{count !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </button>
  );
}

function ExecutionRow({
  exec,
  onClick,
}: {
  exec: Execution;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-3.5 rounded-lg border transition-all text-left hover:border-primary/50 hover:bg-muted/50 group"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-2 h-8 rounded-full shrink-0",
          exec.failed === 0 ? "bg-green-500" : exec.passed === 0 ? "bg-red-500" : "bg-orange-400"
        )} />
        <div>
          <div className="font-medium text-sm">
            {new Date(exec.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-green-500">{exec.passed} passed</span>
            {exec.failed > 0 && <span className="text-xs text-red-500">{exec.failed} failed</span>}
            <span className="text-xs text-muted-foreground">{exec.totalApis} APIs</span>
            <span className="text-xs text-muted-foreground">{exec.avgResponseTime.toFixed(0)}ms avg</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {exec.failed === 0 ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">All passed</Badge>
        ) : (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">{exec.failed} failed</Badge>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}

export function ExecutionTimeline() {
  const { data: executions = [], isLoading } = useListExecutions({
    query: { refetchInterval: 30000, queryKey: getListExecutionsQueryKey() },
  });

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);

  // Current drill level
  const level: DrillLevel =
    selectedHour !== null ? "executions" :
    selectedDay !== null ? "hour" :
    selectedMonth !== null ? "day" :
    selectedYear !== null ? "month" :
    "year";

  // Filter executions at each level
  const filtered = useMemo(() => {
    return executions.filter((e) => {
      const d = new Date(e.startedAt);
      if (selectedYear !== null && d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== null && d.getMonth() !== selectedMonth) return false;
      if (selectedDay !== null && d.getDate() !== selectedDay) return false;
      if (selectedHour !== null && d.getHours() !== selectedHour) return false;
      return true;
    });
  }, [executions, selectedYear, selectedMonth, selectedDay, selectedHour]);

  // Grouped data for each level
  const byYear = useMemo(() => groupBy(executions, (e) => new Date(e.startedAt).getFullYear()), [executions]);
  const byMonth = useMemo(() => selectedYear !== null ? groupBy(
    executions.filter((e) => new Date(e.startedAt).getFullYear() === selectedYear),
    (e) => new Date(e.startedAt).getMonth()
  ) : {}, [executions, selectedYear]);
  const byDay = useMemo(() => (selectedYear !== null && selectedMonth !== null) ? groupBy(
    executions.filter((e) => {
      const d = new Date(e.startedAt);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    }),
    (e) => new Date(e.startedAt).getDate()
  ) : {}, [executions, selectedYear, selectedMonth]);
  const byHour = useMemo(() => (selectedYear !== null && selectedMonth !== null && selectedDay !== null) ? groupBy(
    executions.filter((e) => {
      const d = new Date(e.startedAt);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === selectedDay;
    }),
    (e) => new Date(e.startedAt).getHours()
  ) : {}, [executions, selectedYear, selectedMonth, selectedDay]);

  // Breadcrumbs
  const breadcrumbs: Breadcrumb[] = [{ level: "year", label: "All Years" }];
  if (selectedYear !== null) breadcrumbs.push({ level: "month", label: String(selectedYear) });
  if (selectedMonth !== null) breadcrumbs.push({ level: "day", label: MONTHS[selectedMonth] });
  if (selectedDay !== null) breadcrumbs.push({ level: "hour", label: `${selectedDay} ${MONTHS[selectedMonth!]}` });
  if (selectedHour !== null) breadcrumbs.push({ level: "executions", label: `${String(selectedHour).padStart(2,"0")}:00` });

  function navigateTo(crumb: Breadcrumb) {
    if (crumb.level === "year") { setSelectedYear(null); setSelectedMonth(null); setSelectedDay(null); setSelectedHour(null); }
    else if (crumb.level === "month") { setSelectedMonth(null); setSelectedDay(null); setSelectedHour(null); }
    else if (crumb.level === "day") { setSelectedDay(null); setSelectedHour(null); }
    else if (crumb.level === "hour") { setSelectedHour(null); }
  }

  function goBack() {
    if (selectedHour !== null) setSelectedHour(null);
    else if (selectedDay !== null) setSelectedDay(null);
    else if (selectedMonth !== null) setSelectedMonth(null);
    else if (selectedYear !== null) setSelectedYear(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {level !== "year" && (
            <button
              onClick={goBack}
              className="mr-1 p-1 rounded hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <h3 className="font-semibold">Execution Timeline</h3>
        </div>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.level}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <button
                  onClick={() => !isLast && navigateTo(crumb)}
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-colors",
                    isLast
                      ? "text-foreground font-medium cursor-default"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Body */}
      <div className="p-4">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading executions...</div>
        ) : executions.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 opacity-30" />
            <span>No execution runs yet.</span>
          </div>
        ) : level === "year" ? (
          <div className="flex flex-col gap-2">
            {Object.entries(byYear)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([year, execs]) => {
                const { passed, failed } = passFail(execs);
                return (
                  <DrillCard
                    key={year}
                    label={year}
                    sublabel={`${execs.length} execution run${execs.length !== 1 ? "s" : ""}`}
                    passed={passed}
                    failed={failed}
                    count={execs.length}
                    onClick={() => setSelectedYear(Number(year))}
                  />
                );
              })}
          </div>
        ) : level === "month" ? (
          <div className="flex flex-col gap-2">
            {Object.entries(byMonth)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([month, execs]) => {
                const { passed, failed } = passFail(execs);
                return (
                  <DrillCard
                    key={month}
                    label={MONTHS[Number(month)]}
                    sublabel={`${execs.length} run${execs.length !== 1 ? "s" : ""}`}
                    passed={passed}
                    failed={failed}
                    count={execs.length}
                    onClick={() => setSelectedMonth(Number(month))}
                  />
                );
              })}
          </div>
        ) : level === "day" ? (
          <div className="flex flex-col gap-2">
            {Object.entries(byDay)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([day, execs]) => {
                const { passed, failed } = passFail(execs);
                const d = new Date(execs[0].startedAt);
                return (
                  <DrillCard
                    key={day}
                    label={d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                    sublabel={`${execs.length} run${execs.length !== 1 ? "s" : ""}`}
                    passed={passed}
                    failed={failed}
                    count={execs.length}
                    onClick={() => setSelectedDay(Number(day))}
                  />
                );
              })}
          </div>
        ) : level === "hour" ? (
          <div className="flex flex-col gap-2">
            {Object.entries(byHour)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([hour, execs]) => {
                const { passed, failed } = passFail(execs);
                const h = Number(hour);
                const label = `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00`;
                return (
                  <DrillCard
                    key={hour}
                    label={label}
                    sublabel={`${execs.length} run${execs.length !== 1 ? "s" : ""}`}
                    passed={passed}
                    failed={failed}
                    count={execs.length}
                    onClick={() => setSelectedHour(h)}
                  />
                );
              })}
          </div>
        ) : (
          // Executions list at hour level
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground px-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{filtered.length} run{filtered.length !== 1 ? "s" : ""} in this hour — click any to view details</span>
            </div>
            {filtered
              .slice()
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .map((exec) => (
                <ExecutionRow
                  key={exec.id}
                  exec={exec}
                  onClick={() => setSelectedExecutionId(exec.id)}
                />
              ))}
          </div>
        )}
      </div>

      <ExecutionDetailModal
        executionId={selectedExecutionId}
        onClose={() => setSelectedExecutionId(null)}
      />
    </div>
  );
}
