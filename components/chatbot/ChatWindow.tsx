'use client';

import { memo, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  Check,
  Copy,
  CornerDownLeft,
  Square,
  X,
  Sparkles,
  Trash2,
  Bot,
} from 'lucide-react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { Streamdown } from 'streamdown';
import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ChatStatus, UIMessage } from 'ai';

const QUICK_SUGGESTIONS = [
  { emoji: '📅', label: 'Exam Routine', text: 'What is the exam routine this semester?' },
  { emoji: '📊', label: 'CGPA Calculator', text: 'How do I calculate my CGPA?' },
  { emoji: '✅', label: 'Attendance Policy', text: 'What is the class attendance policy?' },
  { emoji: '🚌', label: 'Bus Schedule', text: 'What are the campus bus schedules?' },
];

const STREAMDOWN_PLUGINS = { cjk, code, math, mermaid };

const MessageMarkdown = memo(
  ({ children, isAnimating }: { children: string; isAnimating?: boolean }) => (
    <Streamdown
      className="size-full text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-relaxed"
      plugins={STREAMDOWN_PLUGINS}
      isAnimating={isAnimating}
    >
      {children}
    </Streamdown>
  ),
  (prev, next) =>
    prev.children === next.children && prev.isAnimating === next.isAnimating
);
MessageMarkdown.displayName = 'MessageMarkdown';

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 h-7 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/40"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function ScrollButton() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  return !isAtBottom ? (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
    >
      <Button
        className="rounded-full shadow-md bg-background/95 backdrop-blur-sm border border-border/50 gap-1.5 text-xs h-7 px-3 hover:bg-background"
        onClick={() => scrollToBottom()}
        size="sm"
        type="button"
        variant="outline"
      >
        <ArrowDown className="size-3" />
        Latest
      </Button>
    </motion.div>
  ) : null;
}

interface ChatWindowProps {
  messages: UIMessage[];
  status: ChatStatus;
  onSend: (text: string) => void;
  onStop: () => void;
  onClose: () => void;
  onClear?: () => void;
}

export function ChatWindow({ messages, status, onSend, onStop, onClose, onClear }: ChatWindowProps) {
  const isStreaming = status === 'submitted' || status === 'streaming';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function getTextContent(msg: UIMessage): string {
    return (
      msg.parts?.find((p): p is { type: 'text'; text: string } => p.type === 'text')?.text ?? ''
    );
  }

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = textareaRef.current?.value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.closest('form')?.requestSubmit();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  const showThinkingPlaceholder =
    status === 'submitted' &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
      className="absolute bottom-[72px] right-0 w-[360px] sm:w-[400px] h-[580px] flex flex-col rounded-2xl bg-card shadow-2xl overflow-hidden ring-1 ring-border/40"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/50 shrink-0 bg-card">
        <div className="relative shrink-0">
          <img src="/aiicon.png" alt="AI" className="size-8 object-contain shrink-0" />
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card transition-colors duration-500',
              isStreaming ? 'bg-emerald-500' : 'bg-border'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold leading-tight">CampusMate AI</span>
            <Sparkles className="size-3 text-amber-500 shrink-0" />
          </div>
          <AnimatePresence mode="wait">
            {status === 'submitted' ? (
              <motion.p
                key="thinking"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="text-[11px] text-muted-foreground"
              >
                Thinking…
              </motion.p>
            ) : status === 'streaming' ? (
              <motion.p
                key="streaming"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="text-[11px] text-emerald-500"
              >
                Responding…
              </motion.p>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="text-[11px] text-muted-foreground"
              >
                SEU Campus Assistant
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-0.5">
          {onClear && messages.length > 0 && !isStreaming && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClear}
                  aria-label="New chat"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">New chat</TooltipContent>
            </Tooltip>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close chat"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <StickToBottom
        className="relative flex-1 overflow-y-hidden"
        initial="smooth"
        resize="smooth"
        role="log"
      >
        <StickToBottom.Content className="flex flex-col px-3 py-4">
          {messages.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-5 min-h-[400px] justify-center py-4 text-center"
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 flex items-center justify-center"
                >
                  <Bot className="size-7 text-primary" />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">Hi, I&apos;m CampusMate AI</h3>
                  <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                    Your SEU campus assistant — ask me anything.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full px-1">
                {QUICK_SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                    onClick={() => onSend(s.text)}
                    type="button"
                    className="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border/80 transition-all duration-150 text-left group"
                  >
                    <span className="text-lg leading-none">{s.emoji}</span>
                    <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground leading-snug transition-colors">
                      {s.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const text = getTextContent(msg);
                const isLatest = index === messages.length - 1;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cn('group flex w-full mb-5', isUser ? 'justify-end' : 'justify-start')}
                  >
                    {isUser ? (
                      /* User bubble */
                      <div className="max-w-[82%]">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
                          {text}
                        </div>
                      </div>
                    ) : (
                      /* AI message — no bubble, plain prose */
                      <div className="flex gap-2.5 max-w-[96%] flex-1">
                        <img src="/aiicon.png" alt="AI" className="size-6 mt-0.5 shrink-0 object-contain" />

                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                          <div className="text-sm leading-relaxed text-foreground">
                            <MessageMarkdown isAnimating={status === 'streaming' && isLatest}>
                              {text}
                            </MessageMarkdown>
                          </div>

                          {/* Action row */}
                          {text && (
                            <div className="flex items-center gap-0.5 -ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    type="button"
                                    onClick={() => handleCopy(msg.id, text)}
                                    className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  >
                                    <AnimatePresence mode="wait" initial={false}>
                                      {copiedId === msg.id ? (
                                        <motion.span
                                          key="check"
                                          initial={{ scale: 0.5 }}
                                          animate={{ scale: 1 }}
                                          exit={{ scale: 0.5 }}
                                        >
                                          <Check className="size-3 text-emerald-500" />
                                        </motion.span>
                                      ) : (
                                        <motion.span key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                          <Copy className="size-3" />
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4}>
                                  {copiedId === msg.id ? 'Copied!' : 'Copy'}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Thinking placeholder */}
              {showThinkingPlaceholder && (
                <motion.div
                  key="thinking-placeholder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2.5 mb-5"
                >
                  <img src="/aiicon.png" alt="AI" className="size-6 mt-0.5 shrink-0 object-contain" />
                  <ThinkingDots />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </StickToBottom.Content>
        <ScrollButton />
      </StickToBottom>

      {/* ── Input area ── */}
      <div className="shrink-0 border-t border-border/50 px-3 pt-2 pb-3">
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex justify-center overflow-hidden"
            >
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onStop}
                className="h-7 gap-1.5 text-xs border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Square className="size-3" />
                Stop generating
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-background/60 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-150 px-3 py-2">
            <textarea
              ref={textareaRef}
              name="message"
              placeholder="Message CampusMate…"
              disabled={isStreaming}
              rows={1}
              onKeyDown={handleKeyDown}
              onChange={handleTextareaChange}
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50 min-h-[28px] max-h-[120px] py-0.5"
            />
            <Button
              type="submit"
              disabled={isStreaming}
              aria-label="Send"
              size="icon-sm"
              className="shrink-0 size-7 rounded-lg"
            >
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5 select-none">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </motion.div>
  );
}
