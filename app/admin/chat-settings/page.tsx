import { getChatbotRateLimitConfig } from '@/lib/chatbot-rate-limit';
import ChatSettingsClient from './ChatSettingsClient';

export default async function ChatSettingsPage() {
  const config = await getChatbotRateLimitConfig();
  return <ChatSettingsClient initialConfig={config} />;
}
