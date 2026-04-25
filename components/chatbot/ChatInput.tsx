'use client';

import { useRef, type KeyboardEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = textareaRef.current?.closest('form');
      if (form && input.trim()) form.requestSubmit();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about exams, CGPA, attendance…"
        disabled={isLoading}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[36px] max-h-24 py-2 leading-relaxed"
      />
      <Button
        type="submit"
        size="icon-sm"
        disabled={isLoading || !input.trim()}
        aria-label="Send"
      >
        <SendHorizonal />
      </Button>
    </form>
  );
}
