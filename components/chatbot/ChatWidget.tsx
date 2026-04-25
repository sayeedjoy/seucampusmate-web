'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChatWindow } from './ChatWindow';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const { messages, status, stop, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chatbot/chat' }),
    onFinish: () => {
      if (!open) setHasUnread(true);
    },
  });

  function handleOpen() {
    setOpen(true);
    setHasUnread(false);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSend(text: string) {
    sendMessage({ text });
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <ChatWindow
            messages={messages}
            status={status}
            onSend={handleSend}
            onStop={stop}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Close chat' : 'Open chat'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {hasUnread && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-green-500 border-2 border-background"
          />
        )}
      </motion.button>
    </div>
  );
}
