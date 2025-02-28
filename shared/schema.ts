import { pgTable, text, serial, integer, boolean, timestamp, real, foreignKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Add pharmacy locations table
export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  phone: text("phone").notNull(),
  operatingHours: text("operating_hours").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Existing tables remain unchanged
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

export const insuranceProviders = pgTable("insurance_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  contactEmail: text("contact_email").notNull(),
  apiKey: text("api_key").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const insuranceClaims = pgTable("insurance_claims", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").notNull().references(() => pharmacies.id),
  medicationId: integer("medication_id").notNull(),
  providerId: integer("provider_id").notNull().references(() => insuranceProviders.id),
  patientName: text("patient_name").notNull(),
  policyNumber: text("policy_number").notNull(),
  claimAmount: real("claim_amount").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  responseDetails: text("response_details"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at")
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").notNull().references(() => pharmacies.id),
  medicationId: integer("medication_id").notNull(),
  quantity: integer("quantity").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
  createdAt: true
});
export const insertMedicationSchema = createInsertSchema(medications).omit({ 
  id: true,
  createdAt: true,
  verifiedAt: true 
});
export const insertProviderSchema = createInsertSchema(insuranceProviders).omit({
  id: true,
  createdAt: true
});
export const insertClaimSchema = createInsertSchema(insuranceClaims).omit({ 
  id: true,
  createdAt: true,
  processedAt: true,
  responseDetails: true
});
export const insertInventorySchema = createInsertSchema(inventory).omit({ 
  id: true,
  updatedAt: true 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Medication = typeof medications.$inferSelect;
export type InsuranceProvider = typeof insuranceProviders.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;