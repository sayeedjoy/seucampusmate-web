'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { ChatbotRateLimitConfig } from '@/lib/chatbot-rate-limit';

export default function ChatSettingsClient({
  initialConfig,
}: {
  initialConfig: ChatbotRateLimitConfig;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialConfig.enabled);
  const [limit, setLimit] = useState(String(initialConfig.limit));
  const [windowSeconds, setWindowSeconds] = useState(String(initialConfig.windowSeconds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    const parsedLimit = Number(limit);
    const parsedWindowSeconds = Number(windowSeconds);

    if (!Number.isFinite(parsedLimit) || parsedLimit < 1) {
      setError('Limit must be a number greater than or equal to 1.');
      setSaving(false);
      return;
    }
    if (!Number.isFinite(parsedWindowSeconds) || parsedWindowSeconds < 60) {
      setError('Window seconds must be a number greater than or equal to 60.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/chatbot-rate-limit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          limit: Math.trunc(parsedLimit),
          windowSeconds: Math.trunc(parsedWindowSeconds),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save settings.');
        return;
      }

      setEnabled(Boolean(data.enabled));
      setLimit(String(data.limit));
      setWindowSeconds(String(data.windowSeconds));
      setSaved(true);
      router.refresh();
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  }

  const windowHours = Math.max(1, Math.round(Number(windowSeconds) / 3600));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chat Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure floating assistant rate limit by IP.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chat Rate Limit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-5">
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <Label htmlFor="enabled" className="text-sm font-medium">
                  Enable rate limit
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, requests above the configured cap are blocked.
                </p>
              </div>
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="limit">Allowed chats per window</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="windowSeconds">Window seconds</Label>
                <Input
                  id="windowSeconds"
                  type="number"
                  min={60}
                  value={windowSeconds}
                  onChange={(e) => setWindowSeconds(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Current interpretation: {limit || initialConfig.limit} chats per ~{windowHours} hour(s)
              per IP.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {saved && !error && <p className="text-sm text-green-600">Settings saved.</p>}

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
