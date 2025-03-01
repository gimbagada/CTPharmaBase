# CTPharmaLink NG - Complete Codebase Export

## 1. Web Application (`/client`)

### Core Files

#### App.tsx
```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

import DashboardPage from "./pages/dashboard";
import AdminPage from "./pages/admin";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

#### Dashboard Components

##### Inventory Management (`/client/src/components/dashboard/inventory.tsx`)
```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema } from "@shared/schema";
import type { Inventory, Medication } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// ... [Rest of inventory.tsx code]
```

##### Voice Reminder (`/client/src/components/dashboard/voice-reminder.tsx`)
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

// ... [Rest of voice-reminder.tsx code]
```

## 2. Mobile Application (`/mobile`)

### Configuration (`/mobile/config.ts`)
```typescript
export const API_URL = 'http://localhost:5000';
export const APP_VERSION = '1.0.0';
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second
```

### Screens

#### Medication Verification (`/mobile/screens/MedicationVerificationScreen.tsx`)
```typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_URL } from '../config';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ... [Rest of MedicationVerificationScreen.tsx code]
```

## 3. Backend Server (`/server`)

### Database Schema (`/shared/schema.ts`)
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, real, foreignKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ... [Complete schema.ts code]
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

// ... [Complete storage.ts code]
```

### API Routes (`/server/routes.ts`)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMedicationSchema, insertClaimSchema, insertInventorySchema, insertProviderSchema, insertPharmacySchema, insertReminderSchema } from "@shared/schema";

// ... [Complete routes.ts code]
```

## Setup Instructions

1. Environment Setup:
```bash
# Create a .env file with:
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
```

2. Install Dependencies:
```bash
npm install
```

3. Initialize Database:
```bash
npm run db:push
```

4. Start Development Server:
```bash
npm run dev
```

### Required Dependencies (package.json):
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@tanstack/react-query": "^5.60.5",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "react": "^18.3.1",
    "wouter": "^3.3.5",
    "zod": "^3.23.8"
    // ... other dependencies as listed in package.json
  }
}
```

Would you like me to provide more detailed code for any specific component or add additional files?
