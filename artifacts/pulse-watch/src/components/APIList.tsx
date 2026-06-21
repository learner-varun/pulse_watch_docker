import React from "react";
import { useListEndpoints, useDeleteEndpoint, getListEndpointsQueryKey, type MonitoredEndpoint } from "@workspace/api-client-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { AddAPIModal } from "./AddAPIModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusColors = {
  healthy: "bg-green-500/10 text-green-500 border-green-500/20",
  warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  pending: "bg-gray-400/10 text-gray-500 border-gray-400/20",
};

export function APIList({ selectedEndpointId, onSelectEndpoint }: { selectedEndpointId: number | null, onSelectEndpoint: (id: number) => void }) {
  const { data: endpoints, isLoading } = useListEndpoints({
    query: { refetchInterval: 30000, queryKey: getListEndpointsQueryKey() }
  });
  
  const queryClient = useQueryClient();
  const deleteEndpoint = useDeleteEndpoint();
  const [editingEndpoint, setEditingEndpoint] = React.useState<MonitoredEndpoint | null>(null);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toast.promise(deleteEndpoint.mutateAsync({ id }), {
      loading: "Deleting endpoint...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey() });
        return "Endpoint deleted";
      },
      error: "Failed to delete endpoint",
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading endpoints...</div>;
  }

  if (!endpoints?.length) {
    return <div className="p-4 text-center text-muted-foreground">No endpoints added yet — click 'Add API' to start monitoring</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Monitored APIs</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {endpoints.map((ep) => (
            <div 
              key={ep.id} 
              className={cn(
                "p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between group",
                selectedEndpointId === ep.id && "bg-muted"
              )}
              onClick={() => onSelectEndpoint(ep.id)}
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[ep.status]}>
                    {ep.status}
                  </Badge>
                  <span className="font-medium truncate">{ep.name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono truncate">{ep.curlCommand}</span>
                <span className="text-xs text-muted-foreground">
                  {ep.lastResponseTime ? `${ep.lastResponseTime}ms` : "No data"} 
                  {ep.lastCheckedAt && ` • ${new Date(ep.lastCheckedAt).toLocaleTimeString()}`}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEndpoint(ep);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleDelete(e, ep.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {editingEndpoint && (
        <AddAPIModal
          open={!!editingEndpoint}
          onOpenChange={(open) => !open && setEditingEndpoint(null)}
          endpoint={editingEndpoint}
        />
      )}
    </div>
  );
}