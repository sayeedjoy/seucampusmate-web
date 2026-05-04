'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Endpoint = {
  path: string;
  methods: string[];
  auth: 'Public' | 'Admin' | 'Superadmin' | 'Admin/Superadmin';
  description: string;
};

const endpoints: Endpoint[] = [
  { path: '/api/chatbot/chat', methods: ['POST'], auth: 'Public', description: 'Chatbot conversation endpoint with rate limiting.' },
  { path: '/api/chatbot/routine', methods: ['GET'], auth: 'Public', description: 'Exam routine query by course code, code list, or search.' },
  { path: '/api/exams', methods: ['GET'], auth: 'Public', description: 'Fetch exam routine dataset.' },
  { path: '/api/exams/course', methods: ['GET'], auth: 'Public', description: 'Fetch exam routine details for a single course.' },
  { path: '/api/exams/preview', methods: ['GET'], auth: 'Public', description: 'Preview exam data before publishing/refreshing.' },
  { path: '/api/exams/refresh', methods: ['GET', 'POST'], auth: 'Public', description: 'Read exam refresh status or trigger refresh.' },
  { path: '/api/cp/users', methods: ['GET'], auth: 'Public', description: 'Codeforces leaderboard users and cache metadata.' },
  { path: '/api/cp/refresh', methods: ['GET', 'POST'], auth: 'Public', description: 'Trigger or inspect CP cache refresh.' },
  { path: '/api/github/contributors', methods: ['GET'], auth: 'Public', description: 'Repository contributor statistics.' },
  { path: '/api/github/stars', methods: ['GET'], auth: 'Public', description: 'Repository star count summary.' },
  { path: '/api/mobile/health', methods: ['OPTIONS', 'GET'], auth: 'Public', description: 'Mobile API health status endpoint.' },
  { path: '/api/mobile/usernames', methods: ['OPTIONS', 'GET'], auth: 'Public', description: 'Mobile API usernames list.' },
  { path: '/api/mobile/users', methods: ['OPTIONS', 'GET'], auth: 'Public', description: 'Mobile API users list.' },
  { path: '/api/auth/[...nextauth]', methods: ['GET', 'POST'], auth: 'Public', description: 'NextAuth handler endpoints (sign-in/session/callback).' },
  { path: '/api/admin/setup', methods: ['GET', 'POST'], auth: 'Public', description: 'Initial admin setup/status endpoint.' },
  { path: '/api/admin/upload', methods: ['POST'], auth: 'Admin', description: 'Upload and process routine files.' },
  { path: '/api/admin/routine', methods: ['DELETE'], auth: 'Admin', description: 'Delete routine records by admin action.' },
  { path: '/api/admin/chat-history', methods: ['GET', 'DELETE'], auth: 'Admin', description: 'Read or clear chatbot conversation history.' },
  { path: '/api/admin/chatbot-rate-limit', methods: ['GET', 'PATCH'], auth: 'Admin', description: 'Read/update chatbot rate limit settings.' },
  { path: '/api/admin/team', methods: ['GET', 'POST'], auth: 'Admin', description: 'List and create team member profiles.' },
  { path: '/api/admin/team/[id]', methods: ['PATCH', 'DELETE'], auth: 'Admin', description: 'Update or remove a team member.' },
  { path: '/api/admin/team/reorder', methods: ['POST'], auth: 'Admin', description: 'Update team member display order.' },
  { path: '/api/admin/api-keys', methods: ['GET', 'POST'], auth: 'Admin', description: 'Create/list stored API keys (legacy management).' },
  { path: '/api/admin/api-keys/[id]', methods: ['PATCH', 'DELETE'], auth: 'Admin/Superadmin', description: 'Enable/disable keys or delete key (delete is superadmin only).' },
  { path: '/api/admin/users', methods: ['GET', 'POST'], auth: 'Superadmin', description: 'Admin user management list/create.' },
  { path: '/api/admin/users/[id]', methods: ['DELETE'], auth: 'Superadmin', description: 'Delete an admin account (restricted safeguards).' },
];

function authVariant(auth: Endpoint['auth']) {
  if (auth === 'Public') return 'default';
  if (auth === 'Superadmin') return 'destructive';
  return 'secondary';
}

export default function ApiDocsClient() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">API Documentation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Reference for all current backend endpoints and access requirements.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Routine API - Proper Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Use <Badge variant="outline" className="mx-1">GET</Badge>
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">/api/chatbot/routine</code>
            with one query parameter: <code className="bg-muted px-1 rounded">code</code>,
            <code className="bg-muted px-1 rounded">codes</code>, or
            <code className="bg-muted px-1 rounded">search</code>.
          </p>
          <div className="space-y-2">
            <p className="font-medium">Single course code</p>
            <code className="block text-xs bg-muted px-3 py-2 rounded font-mono">
              GET /api/chatbot/routine?code=CSE123.2
            </code>
            <p className="font-medium">Multiple course codes (comma-separated)</p>
            <code className="block text-xs bg-muted px-3 py-2 rounded font-mono">
              GET /api/chatbot/routine?codes=CSE123.2,CSE215.1
            </code>
            <p className="font-medium">Search by course title/code text</p>
            <code className="block text-xs bg-muted px-3 py-2 rounded font-mono">
              GET /api/chatbot/routine?search=data+structures
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Endpoints ({endpoints.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-t">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Path</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Methods</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Auth</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {endpoints.map((endpoint) => (
                  <tr key={endpoint.path} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {endpoint.path}
                      </code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {endpoint.methods.map((method) => (
                          <Badge key={`${endpoint.path}-${method}`} variant="outline">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={authVariant(endpoint.auth)}>{endpoint.auth}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{endpoint.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
