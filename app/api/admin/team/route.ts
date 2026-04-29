import { auth } from '@/auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { uploadImage } from '@/lib/cloudinary';
import { asc, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.id));

  return NextResponse.json({ members: rows });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();
  const batch = String(formData.get('batch') ?? '').trim();
  const githubRaw = String(formData.get('githubUrl') ?? '').trim();
  const githubUrl = githubRaw || null;
  const image = formData.get('image');

  if (!name || !role || !batch) {
    return NextResponse.json({ error: 'Name, role, and batch are required.' }, { status: 400 });
  }

  if (!image || !(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
  }

  let uploaded;
  try {
    uploaded = await uploadImage(image, image.name || 'upload.jpg');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const [maxRow] = await db
    .select({ displayOrder: teamMembers.displayOrder })
    .from(teamMembers)
    .orderBy(desc(teamMembers.displayOrder))
    .limit(1);
  const nextOrder = (maxRow?.displayOrder ?? -1) + 1;

  const inserted = await db
    .insert(teamMembers)
    .values({
      name,
      role,
      batch,
      githubUrl,
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId,
      displayOrder: nextOrder,
    })
    .returning();

  return NextResponse.json({ member: inserted[0] }, { status: 201 });
}
