import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTriggerCheck } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, Settings2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AddAPIModal } from "../components/AddAPIModal";
import { SettingsModal } from "../components/SettingsModal";
import { APIHealthOverview } from "../components/APIHealthOverview";
import { APIList } from "../components/APIList";
import { APIResponseGraph } from "../components/APIResponseGraph";
import { ExecutionTimeline } from "../components/ExecutionTimeline";
import { toast } from "sonner";
import { getListEndpointsQueryKey, getGetOverviewQueryKey, getListExecutionsQueryKey } from "@workspace/api-client-react";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [isAddAPIModalOpen, setIsAddAPIModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const triggerCheck = useTriggerCheck();

  const handleRunCheck = () => {
    toast.promise(triggerCheck.mutateAsync(), {
      loading: "Running health checks...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListExecutionsQueryKey() });
        return "Health check triggered successfully!";
      },
      error: "Failed to trigger health check",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-2 rounded-md">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Pulse Watch</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
              <Settings2 className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRunCheck} disabled={triggerCheck.isPending}>
              <Activity className="w-4 h-4 mr-2" />
              Run Check Now
            </Button>
            <Button size="sm" onClick={() => setIsAddAPIModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add API
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-6">
        <APIHealthOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border rounded-lg bg-card overflow-hidden flex flex-col h-[500px]">
            <APIList selectedEndpointId={selectedEndpointId} onSelectEndpoint={setSelectedEndpointId} />
          </div>
          <div className="lg:col-span-2 border rounded-lg bg-card overflow-hidden flex flex-col h-[500px] p-6">
            <APIResponseGraph selectedEndpointId={selectedEndpointId} onSelectEndpoint={setSelectedEndpointId} />
          </div>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <ExecutionTimeline />
        </div>
      </main>

      <AddAPIModal open={isAddAPIModalOpen} onOpenChange={setIsAddAPIModalOpen} />
      <SettingsModal open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
    </div>
  );
}