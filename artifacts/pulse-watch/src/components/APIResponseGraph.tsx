import React from "react";
import { useGetEndpointHistory, getGetEndpointHistoryQueryKey } from "@workspace/api-client-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function APIResponseGraph({ selectedEndpointId }: { selectedEndpointId: number | null }) {
  const { data: history, isLoading } = useGetEndpointHistory(selectedEndpointId!, {
    query: { 
      enabled: !!selectedEndpointId,
      queryKey: getGetEndpointHistoryQueryKey(selectedEndpointId!)
    }
  });

  if (!selectedEndpointId) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Select an API from the list to view its response history</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading chart data...</div>;
  }

  if (!history || history.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No history available for this endpoint</div>;
  }

  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString(),
    responseTime: h.responseTime,
    status: h.status
  }));

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="font-semibold mb-6">Response Time History</h3>
      <div className="flex-1 min-h-0 w-full">
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
      </div>
    </div>
  );
}