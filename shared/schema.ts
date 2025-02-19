import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "pharmacy", "insurance"] }).notNull().default("pharmacy")
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  batchId: text("batch_id").notNull(),
  blockchainHash: text("blockchain_hash").notNull(),
  price: real("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at")
});

export const insuranceClaims = pgTable("insurance_claims", {
  id: serial("id").primaryKey(), 
  pharmacyId: integer("pharmacy_id").notNull(),
  medicationId: integer("medication_id").notNull(),
  patientName: text("patient_name").notNull(),
  insuranceProvider: text("insurance_provider").notNull(),
  claimAmount: real("claim_amount").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").notNull(),
  medicationId: integer("medication_id").notNull(),
  quantity: integer("quantity").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true
});

export const insertMedicationSchema = createInsertSchema(medications);
export const insertClaimSchema = createInsertSchema(insuranceClaims);
export const insertInventorySchema = createInsertSchema(inventory);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
