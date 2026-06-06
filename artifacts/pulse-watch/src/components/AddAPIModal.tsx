import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateEndpoint, useTestEndpoint, getListEndpointsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, FlaskConical } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  curlCommand: z.string().min(1, "cURL command is required"),
  expectedStatusCode: z.coerce.number().int().min(100).max(599),
  expectedResponseTime: z.coerce.number().int().min(1),
});

type FormData = z.infer<typeof schema>;

type TestState =
  | { phase: "idle" }
  | { phase: "testing" }
  | { phase: "done"; status: "passed" | "failed"; responseTime: number; statusCode: number | null; errorMessage: string | null };

export function AddAPIModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [testState, setTestState] = useState<TestState>({ phase: "idle" });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      curlCommand: "",
      expectedStatusCode: 200,
      expectedResponseTime: 300,
    },
  });

  const createEndpoint = useCreateEndpoint();
  const testEndpoint = useTestEndpoint();
  const queryClient = useQueryClient();

  // Reset test state whenever the curl command changes
  const curlCommand = form.watch("curlCommand");
  React.useEffect(() => {
    setTestState({ phase: "idle" });
  }, [curlCommand]);

  const handleTest = async () => {
    const values = form.getValues();
    const valid = await form.trigger(["curlCommand", "expectedStatusCode", "expectedResponseTime"]);
    if (!valid) return;

    setTestState({ phase: "testing" });
    try {
      const result = await testEndpoint.mutateAsync({
        data: {
          name: values.name || "test",
          curlCommand: values.curlCommand,
          expectedStatusCode: values.expectedStatusCode,
          expectedResponseTime: values.expectedResponseTime,
        },
      });
      setTestState({
        phase: "done",
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode ?? null,
        errorMessage: result.errorMessage ?? null,
      });
    } catch {
      setTestState({
        phase: "done",
        status: "failed",
        responseTime: 0,
        statusCode: null,
        errorMessage: "Request failed — check the cURL command",
      });
    }
  };

  const onSubmit = (data: FormData) => {
    toast.promise(createEndpoint.mutateAsync({ data }), {
      loading: "Adding endpoint...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey() });
        onOpenChange(false);
        form.reset();
        setTestState({ phase: "idle" });
        return "Endpoint added successfully";
      },
      error: "Failed to add endpoint",
    });
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      form.reset();
      setTestState({ phase: "idle" });
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Monitored API</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Auth Service Ping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="curlCommand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>cURL Command or URL</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="curl https://api.example.com/health"
                        className="font-mono text-sm"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        onClick={handleTest}
                        disabled={testState.phase === "testing" || !curlCommand}
                      >
                        {testState.phase === "testing" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FlaskConical className="w-3.5 h-3.5" />
                        )}
                        Test
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test result panel */}
            {testState.phase === "testing" && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Sending request…
              </div>
            )}

            {testState.phase === "done" && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm space-y-1.5",
                  testState.status === "passed"
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/30 bg-red-500/5"
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  {testState.status === "passed" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className={testState.status === "passed" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {testState.status === "passed" ? "Test passed" : "Test failed"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground pl-6">
                  {testState.statusCode !== null && (
                    <span>Status <strong className="text-foreground">{testState.statusCode}</strong></span>
                  )}
                  <span>Response time <strong className="text-foreground">{testState.responseTime} ms</strong></span>
                </div>
                {testState.errorMessage && (
                  <p className="text-xs text-red-600 dark:text-red-400 pl-6 leading-snug">{testState.errorMessage}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedStatusCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Status</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedResponseTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Time (ms)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEndpoint.isPending}>
                Add API
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
