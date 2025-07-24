import { useAuth } from "@/contexts/AuthContext";

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
  const { profile } = useAuth();
  
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

  const permissions = profile?.role ? getUserPermissions(profile.role) : getUserPermissions('sales_rep');

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
    userRole: profile?.role || 'sales_rep',
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isSalesRep: profile?.role === 'sales_rep',
  };
};