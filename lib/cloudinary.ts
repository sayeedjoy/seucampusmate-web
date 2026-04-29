import crypto from 'crypto';

function getCloudName(): string {
  const value = process.env.CLOUDINARY_CLOUD_NAME;
  if (!value) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not set');
  }
  return value;
}

function getApiKey(): string {
  const value = process.env.CLOUDINARY_API_KEY;
  if (!value) {
    throw new Error('CLOUDINARY_API_KEY is not set');
  }
  return value;
}

function getApiSecret(): string {
  const value = process.env.CLOUDINARY_API_SECRET;
  if (!value) {
    throw new Error('CLOUDINARY_API_SECRET is not set');
  }
  return value;
}

function getSignature(params: Record<string, string>): string {
  const payload = Object.entries(params)
    .filter(([, v]) => v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${getApiSecret()}`).digest('hex');
}

export type CloudinaryUploadResult = {
  url: string;
  fileId: string;
};

export async function uploadImage(
  file: File | Blob,
  fileName: string,
  folder = 'team'
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = getSignature({ folder, timestamp });

  const form = new FormData();
  form.append('file', file, fileName);
  form.append('api_key', getApiKey());
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', folder);

  const cloudName = getCloudName();
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  const data = (await res.json()) as {
    error?: { message?: string };
    secure_url?: string;
    public_id?: string;
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Cloudinary upload failed: ${res.status}`);
  }
  if (!data.secure_url || !data.public_id) {
    throw new Error('Cloudinary upload response missing secure_url or public_id');
  }
  return { url: data.secure_url, fileId: data.public_id };
}

export async function uploadImageFromBuffer(
  buffer: Buffer,
  fileName: string,
  folder = 'team'
): Promise<CloudinaryUploadResult> {
  const blob = new Blob([new Uint8Array(buffer)]);
  return uploadImage(blob, fileName, folder);
}

export async function deleteImage(fileId: string): Promise<void> {
  if (!fileId) return;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = getSignature({ public_id: fileId, timestamp });

  const form = new URLSearchParams();
  form.set('public_id', fileId);
  form.set('timestamp', timestamp);
  form.set('api_key', getApiKey());
  form.set('signature', signature);

  const cloudName = getCloudName();
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const data = (await res.json().catch(() => ({}))) as { result?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Cloudinary delete failed: ${res.status}`);
  }
  if (data.result !== 'ok' && data.result !== 'not found') {
    throw new Error('Cloudinary delete failed');
  }
}
