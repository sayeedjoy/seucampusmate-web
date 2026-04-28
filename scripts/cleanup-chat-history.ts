import 'dotenv/config';
import { cleanupOldChatHistory } from '@/lib/db/chat-history';

async function main() {
  console.log('Starting chat history cleanup...');

  try {
    const { deleted } = await cleanupOldChatHistory();
    console.log(`✓ Deleted ${deleted} old chat history record(s)`);
  } catch (error) {
    console.error('✗ Cleanup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
