# Guide des Boutons d'Action - BATIFLOW

## Classes CSS disponibles pour les boutons d'action dans les grilles

### Classes de base
- `.btn-action` : Classe de base pour tous les boutons d'action (32x32px, centré, transitions)

### Classes spécialisées avec couleurs

#### 1. Bouton Voir/Visualiser
```css
.btn-action-view
```
- **Couleur de fond** : Gris clair (#F1F5F9)
- **Couleur du texte** : Gris foncé (#475569)
- **Hover** : Fond gris foncé (#64748B) avec texte blanc
- **Usage** : Pour les actions de visualisation/consultation

#### 2. Bouton Modifier/Éditer
```css
.btn-action-edit
```
- **Couleur de fond** : Bleu clair (#DBEAFE)
- **Couleur du texte** : Bleu primaire (var(--primary-color))
- **Hover** : Fond bleu primaire avec texte blanc
- **Usage** : Pour les actions de modification/édition

#### 3. Bouton Supprimer
```css
.btn-action-delete
```
- **Couleur de fond** : Rouge clair (#FEE2E2)
- **Couleur du texte** : Rouge (#DC2626)
- **Hover** : Fond rouge avec texte blanc
- **Usage** : Pour les actions de suppression

#### 4. Bouton Contrat/Document
```css
.btn-action-contract
```
- **Couleur de fond** : Bleu ciel clair (#F0F9FF)
- **Couleur du texte** : Bleu ciel (#0284C7)
- **Hover** : Fond bleu ciel avec texte blanc
- **Usage** : Pour les actions liées aux contrats/documents

#### 5. Bouton Succès/Validation
```css
.btn-action-success
```
- **Couleur de fond** : Vert clair (#DCFCE7)
- **Couleur du texte** : Vert (#16A34A)
- **Hover** : Fond vert avec texte blanc
- **Usage** : Pour les actions de validation/confirmation

#### 6. Bouton Avertissement
```css
.btn-action-warning
```
- **Couleur de fond** : Jaune clair (#FEF3C7)
- **Couleur du texte** : Orange (#D97706)
- **Hover** : Fond orange avec texte blanc
- **Usage** : Pour les actions d'avertissement/attention

## Exemple d'utilisation

```tsx
<Button
  variant="ghost"
  size="icon"
  className="btn-action btn-action-view"
  onClick={() => handleView(item)}
  title="Voir"
>
  <Eye size={16} />
</Button>

<Button
  variant="ghost"
  size="icon"
  className="btn-action btn-action-edit"
  onClick={() => handleEdit(item)}
  title="Modifier"
>
  <Edit size={16} />
</Button>

<Button
  variant="ghost"
  size="icon"
  className="btn-action btn-action-delete"
  onClick={() => handleDelete(item)}
  title="Supprimer"
>
  <Trash2 size={16} />
</Button>
```

## Structure recommandée pour les colonnes d'actions

```tsx
<TableCell className="w-[150px]">
  <div className="flex items-center justify-center gap-1">
    {/* Boutons d'action ici */}
  </div>
</TableCell>
```

## Fichiers déjà mis à jour
- ✅ `/app/(dashboard)/client/page.tsx`
- ✅ `/app/(dashboard)/article/page.tsx`
- ✅ `/app/(dashboard)/affaire/page.tsx`
- ✅ `/app/(dashboard)/personnel/page.tsx`
- ✅ `/app/(dashboard)/carburant/page.tsx`
- ✅ `/app/(dashboard)/categorie/page.tsx`

## Fichiers restants à mettre à jour
Appliquer les mêmes classes dans les autres modules :
- `/app/(dashboard)/categorie-personnel/page.tsx`
- `/app/(dashboard)/contrat/page.tsx`
- `/app/(dashboard)/depenses/page.tsx`
- `/app/(dashboard)/entrepot/page.tsx`
- `/app/(dashboard)/famille/page.tsx`
- `/app/(dashboard)/famille-materiel/page.tsx`
- `/app/(dashboard)/materiel/page.tsx`
- `/app/(dashboard)/mode-paiement/page.tsx`
- `/app/(dashboard)/monnaie/page.tsx`
- `/app/(dashboard)/pays/page.tsx`
- `/app/(dashboard)/proprietaire/page.tsx`
- `/app/(dashboard)/societe/page.tsx`
- `/app/(dashboard)/soustraitant/page.tsx`
- `/app/(dashboard)/stock/page.tsx`
- Et tous les autres modules avec des grilles...

## Notes importantes
- Toujours utiliser la classe de base `.btn-action` avec une classe spécialisée
- Les transitions sont automatiquement appliquées
- Les couleurs respectent la charte graphique BATIFLOW
- Les effets de survol sont cohérents dans toute l'application