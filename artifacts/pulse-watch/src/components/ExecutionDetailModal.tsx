import React from "react";
import { useGetExecution, getGetExecutionQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function ExecutionDetailModal({ executionId, onClose }: { executionId: number | null, onClose: () => void }) {
  const { data: detail, isLoading } = useGetExecution(executionId!, {
    query: { 
      enabled: !!executionId,
      queryKey: getGetExecutionQueryKey(executionId!)
    }
  });

  return (
    <Dialog open={!!executionId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Execution Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">Loading...</div>
        ) : detail ? (
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Started</div>
                <div className="font-medium text-sm">{new Date(detail.startedAt).toLocaleString()}</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Passed</div>
                <div className="font-medium text-green-500">{detail.passed}</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Failed</div>
                <div className="font-medium text-red-500">{detail.failed}</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Avg Time</div>
                <div className="font-medium">{detail.avgResponseTime.toFixed(0)}ms</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.results.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell>
                      <div className="font-medium">{res.endpointName}</div>
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={res.endpointUrl}>{res.endpointUrl}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={res.status === 'passed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}
                      >
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{res.responseTime} ms</TableCell>
                    <TableCell className="text-sm text-destructive max-w-[200px] truncate" title={res.errorMessage || ""}>
                      {res.errorMessage || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex-1 p-8 text-center text-muted-foreground">No details found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}