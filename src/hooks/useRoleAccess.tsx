import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type UserRole = 'admin' | 'manager' | 'sales_rep';

interface RolePermissions {
  canViewAllData: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canImportData: boolean;
  canExportData: boolean;
  canAccessSettings: boolean;
  canManageDeals: boolean;
  canViewReports: boolean;
}

export const useRoleAccess = () => {
  const { user, profile } = useAuth();
  
  // Query to get user's current role using the secure function
  const { data: userRole } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return 'sales_rep';
      
      // Try to call the secure get_current_user_role function
      try {
        const { data, error } = await supabase.rpc('get_current_user_role');
        if (!error && data) {
          return data as UserRole;
        }
      } catch (err) {
        console.warn('Secure role function not available, falling back to profile table');
      }
      
      // Fallback to profile table for backward compatibility
      return profile?.role || 'sales_rep';
    },
    enabled: !!user?.id,
  });
  
  const getUserPermissions = (role: UserRole): RolePermissions => {
    switch (role) {
      case 'admin':
        return {
          canViewAllData: true,
          canEditUsers: true,
          canDeleteUsers: true,
          canImportData: true,
          canExportData: true,
          canAccessSettings: true,
          canManageDeals: true,
          canViewReports: true,
        };
      case 'manager':
        return {
          canViewAllData: true,
          canEditUsers: false,
          canDeleteUsers: false,
          canImportData: true,
          canExportData: true,
          canAccessSettings: false,
          canManageDeals: true,
          canViewReports: true,
        };
      case 'sales_rep':
        return {
          canViewAllData: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canImportData: false,
          canExportData: false,
          canAccessSettings: false,
          canManageDeals: true,
          canViewReports: false,
        };
      default:
        return {
          canViewAllData: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canImportData: false,
          canExportData: false,
          canAccessSettings: false,
          canManageDeals: false,
          canViewReports: false,
        };
    }
  };

  const currentRole = userRole || profile?.role || 'sales_rep';
  const permissions = getUserPermissions(currentRole);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const requiresPermission = (permission: keyof RolePermissions, fallback?: () => void) => {
    if (!hasPermission(permission)) {
      fallback?.();
      return false;
    }
    return true;
  };

  return {
    permissions,
    hasPermission,
    requiresPermission,
    userRole: currentRole,
    isAdmin: currentRole === 'admin',
    isManager: currentRole === 'manager',
    isSalesRep: currentRole === 'sales_rep',
  };
};