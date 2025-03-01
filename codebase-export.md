# Complete Codebase Export

## 1. Web Application (`/client`)

### Dashboard Page (`/client/src/pages/dashboard.tsx`)
```typescript
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicationVerification from "@/components/dashboard/medication-verification";
import InsuranceClaims from "@/components/dashboard/insurance-claims";
import Inventory from "@/components/dashboard/inventory";
import PharmacyFinder from "@/components/dashboard/pharmacy-finder";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import VoiceReminder from "@/components/dashboard/voice-reminder";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CTPharmaLink NG</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="medications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="medications">Medication Verification</TabsTrigger>
            <TabsTrigger value="claims">Insurance Claims</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="finder">Find Pharmacy</TabsTrigger>
            <TabsTrigger value="reminders">Medication Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="medications">
            <MedicationVerification />
          </TabsContent>

          <TabsContent value="claims">
            <InsuranceClaims />
          </TabsContent>

          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>

          <TabsContent value="finder">
            <PharmacyFinder />
          </TabsContent>
          <TabsContent value="reminders">
            <VoiceReminder />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
```

### Voice Reminder Component (`/client/src/components/dashboard/voice-reminder.tsx`)
```typescript
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import type { MedicationReminder, Medication } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Bell, Volume2, VolumeX } from "lucide-react";

// ... [Rest of the voice-reminder.tsx code as shown in the file viewer]
```

### Pharmacy Finder Component (`/client/src/components/dashboard/pharmacy-finder.tsx`)
```typescript
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, MapPinIcon, Clock } from "lucide-react";
import type { Pharmacy, Inventory, Medication } from "@shared/schema";
import { useState } from "react";

// ... [Rest of the pharmacy-finder.tsx code as shown in the file viewer]
```

## 2. Mobile Application (`/mobile`)

### Inventory Screen (`/mobile/screens/InventoryScreen.tsx`)
```typescript
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_URL, RETRY_ATTEMPTS, RETRY_DELAY } from '../config';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ... [Rest of the InventoryScreen.tsx code as shown in the file viewer]
```

## 3. Backend Server (`/server`)

### Schema Definition (`/shared/schema.ts`)
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, real, foreignKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ... [Rest of the schema.ts code as shown in the file viewer]
```

### Storage Implementation (`/server/storage.ts`)
```typescript
import { users, medications, insuranceClaims, inventory, insuranceProviders, pharmacies, type User, type InsertUser, type Medication, type InsertMedication, type InsuranceClaim, type InsertClaim, type Inventory, type InsertInventory, type InsuranceProvider, type InsertProvider, type Pharmacy, type InsertPharmacy } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { medicationReminders, type MedicationReminder, type InsertReminder } from "@shared/schema";

// ... [Rest of the storage.ts code as shown in the file viewer]
```

### API Routes (`/server/routes.ts`)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMedicationSchema, insertClaimSchema, insertInventorySchema, insertProviderSchema, insertPharmacySchema, insertReminderSchema } from "@shared/schema";

// ... [Rest of the routes.ts code as shown in the file viewer]
```

## Setup Instructions

1. Create a new project directory and copy the code files maintaining the same folder structure.

2. Create environment variables file (`.env`):
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
```

3. Install dependencies:
```bash
npm install @tanstack/react-query @hookform/resolvers/zod drizzle-orm express react-hook-form shadcn-ui lucide-react zod
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application should now be running with both web and mobile interfaces accessible.
