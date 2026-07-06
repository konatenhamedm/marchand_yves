import { useSession } from "next-auth/react";
import { useMemo } from "react";
import type { Feature } from "@/app/types/auth";

export function usePermissions(featureCode: string) {
  const { data: session } = useSession();

  return useMemo(() => {
    const user = session?.user as any;

    if (!user) {
      return { canCreate: false, canEdit: false, canDelete: false, canView: false, hasPermission: () => false };
    }

    const isAdmin = user.kind === "admin";
    const features: Feature[] = user.features || [];

    const isFullMerchant = user.kind === "merchant" && features.length === 0;

    if (isAdmin || isFullMerchant) {
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        hasPermission: () => true
      };
    }

    const feature = features.find(f => f.code === featureCode);
    const permissions = feature?.permissions || [];

    const hasPermission = (param: string) => {
      const keyword = param.toLowerCase();
      return permissions.some(
        p => p.code.toLowerCase() === keyword ||
          p.code.toLowerCase().includes(keyword) ||
          p.libelle.toLowerCase().includes(keyword)
      );
    };

    // Selon les données de la base :
    // - 1: 'lecture'
    // - 2: 'creation'
    // - 3: 'modification'
    // - 4: 'suppression'

    const canCreate = hasPermission("creation") || ["crea", "créa", "ajout", "add"].some(k => hasPermission(k));
    const canEdit = hasPermission("modification") || ["modif", "edit", "update"].some(k => hasPermission(k));
    const canDelete = hasPermission("suppression") || ["suppr", "delete", "del"].some(k => hasPermission(k));

    // Pour la lecture on essaye de voir s'il y a la permission de lecture, 
    // ou tout bêtement si la feature est renseignée avec une permission.
    const canView = hasPermission("lecture") || ["lect", "read", "voir", "view"].some(k => hasPermission(k)) || permissions.length > 0;

    return {
      canCreate,
      canEdit,
      canDelete,
      canView,
      hasPermission
    };
  }, [session, featureCode]);
}
