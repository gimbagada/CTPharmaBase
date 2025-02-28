import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMedicationSchema, insertClaimSchema, insertInventorySchema, insertProviderSchema, insertPharmacySchema, insertReminderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Pharmacy location endpoints
  app.get("/api/pharmacies", async (req, res) => {
    const pharmacies = await storage.getPharmacies();
    res.json(pharmacies);
  });

  app.get("/api/pharmacies/search", async (req, res) => {
    const { lat, lng, radius } = req.query;
    const pharmacies = await storage.searchPharmacies(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat(radius as string)
    );
    res.json(pharmacies);
  });

  app.get("/api/pharmacies/:id", async (req, res) => {
    const pharmacy = await storage.getPharmacy(parseInt(req.params.id));
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    res.json(pharmacy);
  });

  app.get("/api/pharmacies/:id/inventory", async (req, res) => {
    const inventory = await storage.getPharmacyInventory(parseInt(req.params.id));
    res.json(inventory);
  });

  app.post("/api/pharmacies", async (req, res) => {
    const data = insertPharmacySchema.parse(req.body);
    const pharmacy = await storage.createPharmacy(data);
    res.json(pharmacy);
  });

  // Medications
  app.get("/api/medications", async (req, res) => {
    const medications = await storage.getMedications();
    res.json(medications);
  });

  app.post("/api/medications/verify", async (req, res) => {
    const { id } = req.body;
    const medication = await storage.verifyMedication(id);
    res.json(medication);
  });

  app.post("/api/medications", async (req, res) => {
    const data = insertMedicationSchema.parse(req.body);
    const medication = await storage.createMedication(data);
    res.json(medication);
  });

  // Insurance Providers
  app.get("/api/providers", async (req, res) => {
    const providers = await storage.getProviders();
    res.json(providers);
  });

  app.get("/api/providers/active", async (req, res) => {
    const providers = await storage.getActiveProviders();
    res.json(providers);
  });

  app.get("/api/providers/:id", async (req, res) => {
    const provider = await storage.getProvider(parseInt(req.params.id));
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  });

  app.post("/api/providers", async (req, res) => {
    const data = insertProviderSchema.parse(req.body);
    const provider = await storage.createProvider(data);
    res.json(provider);
  });

  // Insurance Claims
  app.get("/api/claims", async (req, res) => {
    const claims = await storage.getClaims();
    res.json(claims);
  });

  app.get("/api/claims/provider/:providerId", async (req, res) => {
    const claims = await storage.getClaimsByProvider(parseInt(req.params.providerId));
    res.json(claims);
  });

  app.post("/api/claims", async (req, res) => {
    const data = insertClaimSchema.parse(req.body);
    const claim = await storage.createClaim(data);
    res.json(claim);
  });

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    const inventory = await storage.getInventory();
    res.json(inventory);
  });

  app.post("/api/inventory", async (req, res) => {
    const data = insertInventorySchema.parse(req.body);
    const item = await storage.updateInventory(data);
    res.json(item);
  });

  // Medication Reminders
  app.get("/api/reminders", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const reminders = await storage.getRemindersByUser(req.user.id);
    res.json(reminders);
  });

  app.post("/api/reminders", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = insertReminderSchema.parse({ ...req.body, userId: req.user.id });
    const reminder = await storage.createReminder(data);
    res.json(reminder);
  });

  const httpServer = createServer(app);
  return httpServer;
}