import { users, medications, insuranceClaims, inventory, insuranceProviders, type User, type InsertUser, type Medication, type InsertMedication, type InsuranceClaim, type InsertClaim, type Inventory, type InsertInventory, type InsuranceProvider, type InsertProvider } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Medication methods
  getMedications(): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  verifyMedication(id: number): Promise<Medication>;

  // Insurance provider methods
  getProviders(): Promise<InsuranceProvider[]>;
  getProvider(id: number): Promise<InsuranceProvider | undefined>;
  createProvider(provider: InsertProvider): Promise<InsuranceProvider>;
  getActiveProviders(): Promise<InsuranceProvider[]>;

  // Insurance claims methods
  getClaims(): Promise<InsuranceClaim[]>;
  createClaim(claim: InsertClaim): Promise<InsuranceClaim>;
  getClaimsByProvider(providerId: number): Promise<InsuranceClaim[]>;

  // Inventory methods
  getInventory(): Promise<Inventory[]>;
  updateInventory(item: InsertInventory): Promise<Inventory>;

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

  async getMedications(): Promise<Medication[]> {
    return await db.select().from(medications);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(medications).values(medication).returning();
    return newMedication;
  }

  async verifyMedication(id: number): Promise<Medication> {
    const [medication] = await db
      .update(medications)
      .set({ verifiedAt: new Date() })
      .where(eq(medications.id, id))
      .returning();
    return medication;
  }

  async getProviders(): Promise<InsuranceProvider[]> {
    return await db.select().from(insuranceProviders);
  }

  async getProvider(id: number): Promise<InsuranceProvider | undefined> {
    const [provider] = await db.select().from(insuranceProviders).where(eq(insuranceProviders.id, id));
    return provider;
  }

  async createProvider(provider: InsertProvider): Promise<InsuranceProvider> {
    const [newProvider] = await db.insert(insuranceProviders).values(provider).returning();
    return newProvider;
  }

  async getActiveProviders(): Promise<InsuranceProvider[]> {
    return await db.select().from(insuranceProviders).where(eq(insuranceProviders.active, true));
  }

  async getClaims(): Promise<InsuranceClaim[]> {
    return await db.select().from(insuranceClaims);
  }

  async createClaim(claim: InsertClaim): Promise<InsuranceClaim> {
    const [newClaim] = await db.insert(insuranceClaims).values(claim).returning();
    return newClaim;
  }

  async getClaimsByProvider(providerId: number): Promise<InsuranceClaim[]> {
    return await db.select().from(insuranceClaims).where(eq(insuranceClaims.providerId, providerId));
  }

  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async updateInventory(item: InsertInventory): Promise<Inventory> {
    const [updatedItem] = await db.insert(inventory).values({
      ...item,
      updatedAt: new Date()
    }).returning();
    return updatedItem;
  }
}

export const storage = new DatabaseStorage();