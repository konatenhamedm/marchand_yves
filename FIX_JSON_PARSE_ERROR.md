# Fix: "Unexpected end of JSON input" Error

## 🔍 Problème

L'erreur `Failed to execute 'json' on 'Response': Unexpected end of JSON input` se produit lorsque :
- Une réponse API est vide
- Le serveur retourne une erreur HTML au lieu de JSON
- La connexion réseau échoue

## ✅ Solution

J'ai créé des utilitaires dans `lib/apiHelpers.ts` pour gérer ces cas en toute sécurité.

### Option 1 : Utiliser `safeResponseJson` (Changement minimal)

Remplacez simplement `response.json()` par `safeResponseJson(response)` :

```typescript
// ❌ AVANT (peut échouer)
const data = await response.json();

// ✅ APRÈS (sûr)
import { safeResponseJson } from '@/lib/apiHelpers';
const data = await safeResponseJson(response);
```

### Option 2 : Utiliser `fetchWithSafeJson` (Recommandé)

Pour un code plus propre, utilisez le wrapper complet :

```typescript
import { fetchWithSafeJson } from '@/lib/apiHelpers';

const { data, error, ok } = await fetchWithSafeJson('/api/auth/session');

if (!ok) {
  console.error('Error:', error);
  return;
}

// Utiliser data en toute sécurité
if (data?.user) {
  // ...
}
```

## 📝 Fichiers à corriger

Voici les fichiers qui utilisent `response.json()` et doivent être mis à jour :

### Pages d'authentification
- `app/(auth)/reset/page.tsx` (2 occurrences)
- `app/(auth)/otp/page.tsx` (3 occurrences)

### Pages du dashboard
- `app/(dashboard)/finances/paiements/factures/page.tsx`
- `app/(dashboard)/finances/paiements/reservations/page.tsx`
- `app/(dashboard)/ventes_reservation/page.tsx`
- `app/(dashboard)/finances/factures/page.tsx`
- `app/(dashboard)/finances/ventes/page.tsx`
- `app/(dashboard)/stocks/mouvements/page.tsx`
- `app/(dashboard)/ventes/page.tsx`
- `app/(dashboard)/reservations/page.tsx`
- `app/(dashboard)/modele-boutique/AddClient.tsx`

## 🔧 Exemple de correction complète

### Avant :
```typescript
try {
  const sessionRes = await fetch("/api/auth/session");
  const session = await sessionRes.json(); // ❌ Peut échouer

  if (session?.user) {
    // ...
  }
} catch (error) {
  console.error("Erreur:", error);
}
```

### Après (Option 1 - Changement minimal) :
```typescript
import { safeResponseJson } from '@/lib/apiHelpers';

try {
  const sessionRes = await fetch("/api/auth/session");
  
  if (!sessionRes.ok) {
    console.error("Session fetch failed:", sessionRes.status);
    return;
  }
  
  const session = await safeResponseJson(sessionRes); // ✅ Sûr

  if (session?.user) {
    // ...
  }
} catch (error) {
  console.error("Erreur:", error);
}
```

### Après (Option 2 - Recommandé) :
```typescript
import { fetchWithSafeJson } from '@/lib/apiHelpers';

try {
  const { data: session, error, ok } = await fetchWithSafeJson("/api/auth/session");
  
  if (!ok) {
    console.error("Session fetch failed:", error);
    return;
  }

  if (session?.user) {
    // ...
  }
} catch (error) {
  console.error("Erreur:", error);
}
```

## 🚀 Correction rapide avec sed (optionnel)

Pour corriger automatiquement tous les fichiers, vous pouvez utiliser :

```bash
# Ajouter l'import dans chaque fichier
find ./app -name "*.tsx" -type f -exec sed -i '' '1i\
import { safeResponseJson } from "@/lib/apiHelpers";\
' {} +

# Note: Vous devrez ensuite remplacer manuellement response.json() 
# par safeResponseJson(response) dans chaque fichier
```

## 🎯 Vérification

Après correction, testez :
1. Connexion/déconnexion
2. Chargement des pages du dashboard
3. Opérations avec les API

L'erreur ne devrait plus apparaître dans la console.