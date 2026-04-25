import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const examSchedules = pgTable('exam_schedules', {
  id: serial('id').primaryKey(),
  program: text('program').notNull().default(''),
  slot: text('slot').notNull().default(''),
  date: text('date').notNull().default(''),
  startTime: text('start_time').notNull().default(''),
  endTime: text('end_time').notNull().default(''),
  courseCode: text('course_code').notNull().default(''),
  courseTitle: text('course_title').notNull().default(''),
  students: text('students').notNull().default(''),
  faculty: text('faculty').notNull().default(''),
});

export const uploadHistory = pgTable('upload_history', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  uploadedBy: integer('uploaded_by').references(() => adminUsers.id, { onDelete: 'set null' }),
  rowCount: integer('row_count').notNull().default(0),
  status: text('status').notNull().default('success'),
  errorMessage: text('error_message'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  createdById: integer('created_by_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type ExamSchedule = typeof examSchedules.$inferSelect;
export type UploadHistory = typeof uploadHistory.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
