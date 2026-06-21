import React from "react";
import { useGetEndpointHistory, getGetEndpointHistoryQueryKey, useListEndpoints, useDeleteEndpoint, getListEndpointsQueryKey } from "@workspace/api-client-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AddAPIModal } from "./AddAPIModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function APIResponseGraph({ 
  selectedEndpointId, 
  onSelectEndpoint 
}: { 
  selectedEndpointId: number | null; 
  onSelectEndpoint: (id: number | null) => void; 
}) {
  const { data: history, isLoading } = useGetEndpointHistory(selectedEndpointId!, {
    query: { 
      enabled: !!selectedEndpointId,
      queryKey: getGetEndpointHistoryQueryKey(selectedEndpointId!)
    }
  });

  const { data: endpoints } = useListEndpoints();
  const endpoint = endpoints?.find(e => e.id === selectedEndpointId);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const deleteEndpoint = useDeleteEndpoint();

  const handleDelete = () => {
    if (!endpoint) return;
    toast.promise(deleteEndpoint.mutateAsync({ id: endpoint.id }), {
      loading: "Deleting endpoint...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey() });
        onSelectEndpoint(null);
        return "Endpoint deleted";
      },
      error: "Failed to delete endpoint",
    });
  };

  if (!selectedEndpointId) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Select an API from the list to view its response history</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading chart data...</div>;
  }

  const chartData = history ? history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString(),
    responseTime: h.responseTime,
    status: h.status
  })) : [];

  return (
    <div className="flex flex-col h-full w-full relative">
      <h3 className="font-semibold mb-6">Response Time History</h3>
      
      <div className="flex-1 min-h-0 w-full pb-12 flex items-center justify-center">
        {!history || history.length === 0 ? (
          <div className="text-muted-foreground text-sm">No history available for this endpoint yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {endpoint && (
        <div className="absolute bottom-0 right-0 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit API
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleteEndpoint.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete API
          </Button>
        </div>
      )}

      {isEditModalOpen && endpoint && (
        <AddAPIModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          endpoint={endpoint}
        />
      )}
    </div>
  );
}