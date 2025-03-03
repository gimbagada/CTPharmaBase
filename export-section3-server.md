# Section 3: Backend Server (/server)

## Directory Structure
```
/server
├── db/
│   └── index.ts
├── routes/
│   └── index.ts
├── auth.ts
├── storage.ts
└── index.ts
```

## Core Files

### 1. /server/index.ts
```typescript
import express from 'express';
import { json } from 'body-parser';
import { registerRoutes } from './routes';
import { db } from './db';

const app = express();
app.use(json());

// CORS configuration for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register all routes
const server = registerRoutes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. /shared/schema.ts
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, real, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Medications
export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  manufacturer: text('manufacturer').notNull(),
  batchNumber: text('batch_number').notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  verified: boolean('verified').default(false).notNull()
});

// Insurance Claims
export const insuranceClaims = pgTable('insurance_claims', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  medicationId: integer('medication_id').references(() => medications.id).notNull(),
  providerId: integer('provider_id').references(() => insuranceProviders.id).notNull(),
  amount: real('amount').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Medication Reminders
export const medicationReminders = pgTable('medication_reminders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  medicationId: integer('medication_id').references(() => medications.id).notNull(),
  message: text('message').notNull(),
  reminderTime: timestamp('reminder_time').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertClaim = typeof insuranceClaims.$inferInsert;
export type MedicationReminder = typeof medicationReminders.$inferSelect;
export type InsertReminder = typeof medicationReminders.$inferInsert;

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertMedicationSchema = createInsertSchema(medications);
export const insertClaimSchema = createInsertSchema(insuranceClaims);
export const insertReminderSchema = createInsertSchema(medicationReminders);
```

### 3. /server/storage.ts
```typescript
import { users, medications, insuranceClaims, type User, type InsertUser, type Medication, type InsertMedication, type InsuranceClaim, type InsertClaim } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { medicationReminders, type MedicationReminder, type InsertReminder } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Medication methods
  getMedications(): Promise<Medication[]>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  verifyMedication(id: number): Promise<Medication>;

  // Insurance claim methods
  getClaims(): Promise<InsuranceClaim[]>;
  createClaim(claim: InsertClaim): Promise<InsuranceClaim>;
  getClaimsByUser(userId: number): Promise<InsuranceClaim[]>;

  // Reminder methods
  getReminders(): Promise<MedicationReminder[]>;
  createReminder(reminder: InsertReminder): Promise<MedicationReminder>;
  getRemindersByUser(userId: number): Promise<MedicationReminder[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Medication methods implementation
  async getMedications(): Promise<Medication[]> {
    return await db.select().from(medications);
  }

  async getMedicationById(id: number): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));
    return medication;
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const [medication] = await db
      .insert(medications)
      .values(insertMedication)
      .returning();
    return medication;
  }

  async verifyMedication(id: number): Promise<Medication> {
    const [medication] = await db
      .update(medications)
      .set({ verified: true })
      .where(eq(medications.id, id))
      .returning();
    return medication;
  }

  // Insurance claim methods implementation
  async getClaims(): Promise<InsuranceClaim[]> {
    return await db.select().from(insuranceClaims);
  }

  async createClaim(insertClaim: InsertClaim): Promise<InsuranceClaim> {
    const [claim] = await db
      .insert(insuranceClaims)
      .values(insertClaim)
      .returning();
    return claim;
  }

  async getClaimsByUser(userId: number): Promise<InsuranceClaim[]> {
    return await db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.userId, userId));
  }

  // Reminder methods implementation
  async getReminders(): Promise<MedicationReminder[]> {
    return await db.select().from(medicationReminders);
  }

  async createReminder(reminder: InsertReminder): Promise<MedicationReminder> {
    const [newReminder] = await db
      .insert(medicationReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async getRemindersByUser(userId: number): Promise<MedicationReminder[]> {
    return await db
      .select()
      .from(medicationReminders)
      .where(eq(medicationReminders.userId, userId));
  }
}

export const storage = new DatabaseStorage();
```

## Setup Instructions

1. Environment Variables:
Create a `.env` file with:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
PORT=5000
```

2. Database Setup:
```bash
# Initialize database
npm run db:push
```

3. Start Server:
```bash
npm run dev
```

This completes the export of all three sections of the codebase. Would you like me to provide any additional details or clarification about any specific section?
