import React from "react";
import { useGetOverview, getGetOverviewQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function APIHealthOverview() {
  const { data: overview, isLoading } = useGetOverview({
    query: { refetchInterval: 30000, queryKey: getGetOverviewQueryKey() }
  });

  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total APIs</p>
            <h3 className="text-2xl font-bold">{overview.totalApis}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Healthy</p>
            <h3 className="text-2xl font-bold">{overview.healthyApis}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Failed</p>
            <h3 className="text-2xl font-bold">{overview.failedApis}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
            <h3 className="text-2xl font-bold">{overview.avgResponseTime.toFixed(0)} ms</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}