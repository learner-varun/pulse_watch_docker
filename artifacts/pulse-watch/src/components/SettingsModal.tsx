import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const schema = z.object({
  checkIntervalMinutes: z.coerce.number().int().min(1).max(60),
});

export function SettingsModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { theme, setTheme } = useTheme();
  
  const { data: settings } = useGetSettings({
    query: { enabled: open, queryKey: getGetSettingsQueryKey() }
  });
  
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIntervalMinutes: 5,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({ checkIntervalMinutes: settings.checkIntervalMinutes });
    }
  }, [settings, form]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    toast.promise(updateSettings.mutateAsync({ data }), {
      loading: "Saving settings...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        onOpenChange(false);
        return "Settings saved successfully";
      },
      error: "Failed to save settings",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Theme</label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="checkIntervalMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Interval (Minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                <Button type="submit" disabled={updateSettings.isPending}>Save Settings</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}