'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
  Bot,
  User,
  MoreVertical,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Clock,
  Globe,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRecord {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  totalSessions: number;
  totalRecords: number;
}

interface ChatHistoryResponse {
  records: ChatRecord[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

function SessionGroup({
  sessionId,
  messages,
  onDeleteMessage,
  onDeleteSession,
  deletingId,
  selected,
  onToggleSelected,
}: {
  sessionId: string;
  messages: ChatRecord[];
  onDeleteMessage: (id: string) => void;
  onDeleteSession: (sessionId: string) => void;
  deletingId: string | null;
  selected: boolean;
  onToggleSelected: (sessionId: string, checked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const firstAt = messages[messages.length - 1]?.createdAt;
  const lastAt = messages[0]?.createdAt;
  const ip = messages[0]?.ipAddress;
  const userAgent = messages[0]?.userAgent;

  async function handleCopy() {
    await navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortId = sessionId.length > 20 ? `${sessionId.slice(0, 8)}…${sessionId.slice(-8)}` : sessionId;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Session header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
        <input
          type="checkbox"
          className="size-4 shrink-0 accent-primary"
          checked={selected}
          onChange={(e) => onToggleSelected(sessionId, e.target.checked)}
          aria-label={`Select session ${sessionId}`}
        />
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left group"
        >
          {expanded ? (
            <ChevronUp className="size-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
          )}
          <Badge variant="secondary" className="shrink-0 text-[10px] h-5">
            Session
          </Badge>
          <code className="text-xs font-mono text-muted-foreground truncate group-hover:text-foreground transition-colors">
            {shortId}
          </code>
        </button>

        <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3" />
            {messages.length}
          </span>
          {ip && (
            <span className="hidden sm:flex items-center gap-1">
              <Globe className="size-3" />
              {ip}
            </span>
          )}
          {firstAt && (
            <span className="hidden md:flex items-center gap-1">
              <Clock className="size-3" />
              {format(new Date(firstAt), 'MMM d, HH:mm')}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Copy session ID"
        >
          {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
        </button>

        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <MoreVertical className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setExpanded((v) => !v)}>
                {expanded ? 'Collapse' : 'Expand'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="size-4 mr-2" />
                  Delete Session
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                Delete Session
              </DialogTitle>
              <DialogDescription>
                This will permanently delete all {messages.length} messages in this session.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDeleteSession(sessionId);
                  setConfirmDelete(false);
                }}
              >
                Delete Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      {expanded && (
        <div className="divide-y">
          {messages.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onDelete={onDeleteMessage}
              deleting={deletingId === msg.id}
            />
          ))}
        </div>
      )}

      {/* Collapsed preview */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors text-left"
        >
          {messages[0]?.role === 'user' ? 'User: ' : 'AI: '}
          <span className="italic truncate">
            {messages[0]?.content.slice(0, 120)}
            {(messages[0]?.content.length ?? 0) > 120 ? '…' : ''}
          </span>
        </button>
      )}
    </div>
  );
}

function MessageRow({
  msg,
  onDelete,
  deleting,
}: {
  msg: ChatRecord;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = msg.content.length > 300;
  const displayContent = !isLong || expanded ? msg.content : msg.content.slice(0, 300) + '…';

  return (
    <div
      className={cn(
        'px-4 py-3 group hover:bg-muted/20 transition-colors',
        msg.role === 'assistant' && 'bg-muted/10'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {msg.role === 'user' ? (
            <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="size-3.5 text-primary" />
            </div>
          ) : (
            <div className="size-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Bot className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'text-xs font-medium',
                msg.role === 'user' ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {msg.role === 'user' ? 'User' : 'AI'}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(msg.createdAt), 'MMM d, yyyy · HH:mm:ss')}
            </span>
          </div>

          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
            {displayContent}
          </p>

          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-xs text-primary hover:underline"
            >
              {expanded ? 'Show less' : `Show all ${msg.content.length} chars`}
            </button>
          )}

          {msg.userAgent && (
            <p className="text-[11px] text-muted-foreground mt-1.5 truncate max-w-lg">
              {msg.userAgent}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0">
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(msg.id)}
              disabled={deleting}
            >
              <Trash2 className="size-4 mr-2" />
              {deleting ? 'Deleting…' : 'Delete Message'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function ChatHistoryClient() {
  const router = useRouter();
  const [records, setRecords] = useState<ChatRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [sessionInput, setSessionInput] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [deletingSelected, setDeletingSelected] = useState(false);

  const startIndex = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalRecords);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSessionFilter(sessionInput.trim());
      setPage(1);
      setSelectedSessions(new Set());
    }, 300);
    return () => clearTimeout(timer);
  }, [sessionInput]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (sessionFilter) params.set('sessionId', sessionFilter);
      const res = await fetch(`/api/admin/chat-history?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ChatHistoryResponse = await res.json();
      setRecords(data.records);
      setTotalRecords(data.totalRecords);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sessionFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setSelectedSessions(new Set());
  }, [page]);

  async function handleDeleteMessage(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/chat-history?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      const res = await fetch(
        `/api/admin/chat-history?sessionId=${encodeURIComponent(sessionId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete session');
      await fetchHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete session');
    }
  }

  async function handleDeleteAll() {
    setDeletingAll(true);
    try {
      const res = await fetch('/api/admin/chat-history?all=true', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete all');
      await fetchHistory();
      setConfirmDeleteAll(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete all records');
    } finally {
      setDeletingAll(false);
    }
  }

  async function handleDeleteSelectedSessions() {
    const sessionIds = Array.from(selectedSessions);
    if (sessionIds.length === 0) return;
    setDeletingSelected(true);
    try {
      const res = await fetch('/api/admin/chat-history', {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ sessionIds }),
      });
      if (!res.ok) throw new Error('Failed to delete selected sessions');
      setSelectedSessions(new Set());
      await fetchHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete selected sessions');
    } finally {
      setDeletingSelected(false);
    }
  }

  const groupedBySession = useMemo(() => {
    const map = new Map<string, ChatRecord[]>();
    for (const record of records) {
      const list = map.get(record.sessionId) ?? [];
      list.push(record);
      map.set(record.sessionId, list);
    }
    return map;
  }, [records]);

  const sessionCount = groupedBySession.size;
  const uniqueSessionsTotal = records[0]?.totalSessions ?? 0;
  const pageSessionIds = Array.from(groupedBySession.keys());
  const selectedCount = selectedSessions.size;
  const allPageSelected = pageSessionIds.length > 0 && pageSessionIds.every((id) => selectedSessions.has(id));

  function toggleSelectAllCurrentPage(checked: boolean) {
    if (checked) {
      setSelectedSessions(new Set(pageSessionIds));
      return;
    }
    setSelectedSessions(new Set());
  }

  function toggleSessionSelection(sessionId: string, checked: boolean) {
    setSelectedSessions((prev) => {
      const next = new Set(prev);
      if (checked) next.add(sessionId);
      else next.delete(sessionId);
      return next;
    });
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage user conversations
          </p>
        </div>
        <Dialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2 shrink-0" disabled={totalRecords === 0}>
              <Trash2 className="size-4" />
              Delete All
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                Delete All Chat History
              </DialogTitle>
              <DialogDescription>
                This will permanently delete all {totalRecords.toLocaleString()} messages across all sessions.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteAll(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAll} disabled={deletingAll}>
                {deletingAll ? 'Deleting…' : 'Delete All'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Messages</p>
          <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sessions (this page)</p>
          <p className="text-2xl font-bold">{sessionCount}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Showing</p>
          <p className="text-2xl font-bold">
            {totalRecords === 0 ? '0' : `${startIndex}–${endIndex}`}
          </p>
        </div>
      </div>

      {/* Filter + controls */}
      <Card>
        <CardHeader className="pb-3 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Filter by session ID…"
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchHistory}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={allPageSelected}
                onChange={(e) => toggleSelectAllCurrentPage(e.target.checked)}
                disabled={pageSessionIds.length === 0}
              />
              Select all sessions on this page
            </label>
            <Button
              variant="destructive"
              size="sm"
              className="h-7"
              disabled={selectedCount === 0 || deletingSelected}
              onClick={handleDeleteSelectedSessions}
            >
              {deletingSelected ? 'Deleting...' : `Delete selected (${selectedCount})`}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {loading && records.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-muted-foreground">
              <RefreshCw className="size-6 mx-auto animate-spin opacity-50" />
              <p className="text-sm">Loading chat history…</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <MessageSquare className="size-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {sessionFilter ? `No messages found for session "${sessionFilter}"` : 'No chat history found'}
              </p>
              {sessionFilter && (
                <Button variant="ghost" size="sm" onClick={() => setSessionInput('')}>
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(groupedBySession.entries()).map(([sessionId, messages]) => (
                <SessionGroup
                  key={sessionId}
                  sessionId={sessionId}
                  messages={messages}
                  onDeleteMessage={handleDeleteMessage}
                  onDeleteSession={handleDeleteSession}
                  deletingId={deletingId}
                  selected={selectedSessions.has(sessionId)}
                  onToggleSelected={toggleSessionSelection}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} · {totalRecords.toLocaleString()} total messages
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page <= 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
