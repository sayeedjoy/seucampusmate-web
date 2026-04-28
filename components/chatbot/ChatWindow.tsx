'use client';

import { memo, useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Bot, Copy, CornerDownLeft, Square, X } from 'lucide-react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { Streamdown } from 'streamdown';
import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import type { ChatStatus, UIMessage } from 'ai';

// ── Constants ───────────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  'Exam routine this semester?',
  'How to calculate CGPA?',
  'Class attendance policy?',
  'Campus bus schedule?',
];

const STREAMDOWN_PLUGINS = { cjk, code, math, mermaid };

// ── Sub-components ──────────────────────────────────────────────────────────

const MessageMarkdown = memo(
  ({ children, isAnimating }: { children: string; isAnimating?: boolean }) => (
    <Streamdown
      className="size-full text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
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

function ThinkingText({ children }: { children: string }) {
  return (
    <motion.p
      className="text-xs text-muted-foreground"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.p>
  );
}

function ScrollButton() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  return !isAtBottom ? (
    <Button
      className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-md"
      onClick={() => scrollToBottom()}
      size="icon"
      type="button"
      variant="outline"
    >
      <ArrowDown className="size-4" />
    </Button>
  ) : null;
}

// ── Main component ───────────────────────────────────────────────────────────

interface ChatWindowProps {
  messages: UIMessage[];
  status: ChatStatus;
  onSend: (text: string) => void;
  onStop: () => void;
  onClose: () => void;
}

export function ChatWindow({ messages, status, onSend, onStop, onClose }: ChatWindowProps) {
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
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute bottom-[72px] right-0 w-[360px] sm:w-[400px] h-[540px] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border shrink-0 bg-card/80 backdrop-blur-sm">
        <div className="relative shrink-0 flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" />
          {isStreaming && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">SEU CampusMate AI</p>
          {isStreaming ? (
            <ThinkingText>
              {status === 'submitted' ? 'Thinking…' : 'Responding…'}
            </ThinkingText>
          ) : (
            <p className="text-xs text-muted-foreground truncate">
              Ask about exams, CGPA &amp; more
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close chat">
          <X />
        </Button>
      </div>

      {/* Messages */}
      <StickToBottom
        className="relative flex-1 overflow-y-hidden"
        initial="smooth"
        resize="smooth"
        role="log"
      >
        <StickToBottom.Content className="flex flex-col gap-4 px-3 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 min-h-[360px] py-8 text-center">
              <div className="flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary">
                <Bot className="size-7 opacity-80" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm">Hi! I'm CampusMate AI</h3>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-[240px]">
                  Ask me about your exam routine, CGPA, attendance, or anything campus-related.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSend(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              const text = getTextContent(msg);
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'group flex w-full max-w-[95%] flex-col gap-1',
                    isUser ? 'ml-auto items-end' : 'items-start'
                  )}
                >
                  <div className={cn('flex items-start gap-2', isUser && 'justify-end')}>
                    {!isUser && (
                      <Image
                        src="/chatbot/reply-icon.svg"
                        alt="AI reply"
                        width={18}
                        height={18}
                        className="mt-1 shrink-0"
                      />
                    )}
                    <div
                      className={cn(
                        'w-fit min-w-0 max-w-full rounded-lg text-sm overflow-hidden',
                        isUser && 'bg-secondary text-foreground px-4 py-3'
                      )}
                    >
                      <MessageMarkdown isAnimating={isStreaming && msg === messages.at(-1)}>
                        {text}
                      </MessageMarkdown>
                    </div>
                  </div>
                  {!isUser && (
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            onClick={() => handleCopy(msg.id, text)}
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedId === msg.id ? 'Copied!' : 'Copy'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </StickToBottom.Content>
        <ScrollButton />
      </StickToBottom>

      {/* Input */}
      <div className="shrink-0 border-t border-border">
        <form onSubmit={handleSubmit}>
          <InputGroup className="rounded-none border-0">
            <InputGroupTextarea
              ref={textareaRef}
              name="message"
              placeholder="Ask about exams, CGPA, attendance…"
              disabled={isStreaming}
              rows={1}
              onKeyDown={handleKeyDown}
              onChange={handleTextareaChange}
              className="min-h-10 max-h-24 text-sm"
            />
            <InputGroupAddon align="block-end" className="justify-between pb-2">
              <span />
              {status === 'submitted' ? (
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="default"
                  onClick={onStop}
                  aria-label="Stop"
                >
                  <Spinner />
                </InputGroupButton>
              ) : status === 'streaming' ? (
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="default"
                  onClick={onStop}
                  aria-label="Stop"
                >
                  <Square className="size-4" />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  aria-label="Send"
                >
                  <CornerDownLeft className="size-4" />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </motion.div>
  );
}
