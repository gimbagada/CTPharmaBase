import { users, medications, insuranceClaims, inventory, insuranceProviders, pharmacies, type User, type InsertUser, type Medication, type InsertMedication, type InsuranceClaim, type InsertClaim, type Inventory, type InsertInventory, type InsuranceProvider, type InsertProvider, type Pharmacy, type InsertPharmacy } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { medicationReminders, type MedicationReminder, type InsertReminder } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Pharmacy methods
  getPharmacies(): Promise<Pharmacy[]>;
  getPharmacy(id: number): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  searchPharmacies(lat: number, lng: number, radius: number): Promise<Pharmacy[]>;
  getPharmacyInventory(pharmacyId: number): Promise<Inventory[]>;

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

  async getPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies);
  }

  async getPharmacy(id: number): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy;
  }

  async createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy> {
    const [newPharmacy] = await db.insert(pharmacies).values(pharmacy).returning();
    return newPharmacy;
  }

  async searchPharmacies(lat: number, lng: number, radius: number): Promise<Pharmacy[]> {
    const haversine = sql`
      6371 * 2 * ASIN(
        SQRT(
          POWER(SIN(RADIANS(${lat} - latitude) / 2), 2) +
          COS(RADIANS(${lat})) * COS(RADIANS(latitude)) *
          POWER(SIN(RADIANS(${lng} - longitude) / 2), 2)
        )
      )
    `;

    type PharmacyWithDistance = Pharmacy & { distance: number };

    const results = await db
      .select({
        id: pharmacies.id,
        name: pharmacies.name,
        address: pharmacies.address,
        city: pharmacies.city,
        state: pharmacies.state,
        zipCode: pharmacies.zipCode,
        latitude: pharmacies.latitude,
        longitude: pharmacies.longitude,
        phone: pharmacies.phone,
        operatingHours: pharmacies.operatingHours,
        isActive: pharmacies.isActive,
        createdAt: pharmacies.createdAt,
        distance: haversine,
      })
      .from(pharmacies)
      .where(sql`${haversine} <= ${radius}`)
      .orderBy(haversine);

    return results.map(({ distance, ...pharmacy }) => pharmacy as Pharmacy);
  }

  async getPharmacyInventory(pharmacyId: number): Promise<Inventory[]> {
    return await db
      .select()
      .from(inventory)
      .where(eq(inventory.pharmacyId, pharmacyId));
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

  async getReminders(): Promise<MedicationReminder[]> {
    return await db.select().from(medicationReminders);
  }

  async createReminder(reminder: InsertReminder): Promise<MedicationReminder> {
    const [newReminder] = await db.insert(medicationReminders).values(reminder).returning();
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