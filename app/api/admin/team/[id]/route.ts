import { auth } from '@/auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { deleteImage, uploadImage } from '@/lib/cloudinary';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const [existing] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
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

  let imageUrl = existing.imageUrl;
  let imageFileId = existing.imageFileId;

  if (image instanceof File && image.size > 0) {
    let uploaded;
    try {
      uploaded = await uploadImage(image, image.name || 'upload.jpg');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    if (existing.imageFileId) {
      try {
        await deleteImage(existing.imageFileId);
      } catch {
        // best-effort
      }
    }
    imageUrl = uploaded.url;
    imageFileId = uploaded.fileId;
  }

  const updated = await db
    .update(teamMembers)
    .set({
      name,
      role,
      batch,
      githubUrl,
      imageUrl,
      imageFileId,
      updatedAt: new Date(),
    })
    .where(eq(teamMembers.id, id))
    .returning();

  return NextResponse.json({ member: updated[0] });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const [existing] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  if (existing.imageFileId) {
    try {
      await deleteImage(existing.imageFileId);
    } catch {
      // best-effort
    }
  }

  await db.delete(teamMembers).where(eq(teamMembers.id, id));

  return NextResponse.json({ success: true });
}
