import { ADMIN_ROLES } from './constants';

type AdminRole = 'super_admin' | 'content_manager' | 'moderator';

interface PermissionConfig {
  allowedRoles: AdminRole[];
}

// Permission definitions for different features
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },

  // Content Management
  VIEW_CONTENT: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  CREATE_CONTENT: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  EDIT_CONTENT: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  DELETE_CONTENT: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  PUBLISH_CONTENT: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },

  // Questions
  VIEW_QUESTIONS: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  CREATE_QUESTIONS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  EDIT_QUESTIONS: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  DELETE_QUESTIONS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  BULK_IMPORT_QUESTIONS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },

  // Quizzes
  VIEW_QUIZZES: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  CREATE_QUIZZES: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  EDIT_QUIZZES: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },
  DELETE_QUIZZES: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },

  // User Management
  VIEW_USERS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
  EDIT_USERS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
  DISABLE_USERS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },

  // Analytics
  VIEW_ANALYTICS: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  EXPORT_ANALYTICS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER],
  },

  // Reports & Feedback
  VIEW_REPORTS: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  REVIEW_REPORTS: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },
  RESOLVE_REPORTS: {
    allowedRoles: [
      ADMIN_ROLES.SUPER_ADMIN,
      ADMIN_ROLES.CONTENT_MANAGER,
      ADMIN_ROLES.MODERATOR,
    ],
  },

  // Admin Management
  VIEW_ADMINS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
  CREATE_ADMINS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
  EDIT_ADMINS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
  DELETE_ADMINS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },

  // System Configuration
  VIEW_CONFIG: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
  EDIT_CONFIG: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },

  // Audit Logs
  VIEW_AUDIT_LOGS: {
    allowedRoles: [ADMIN_ROLES.SUPER_ADMIN],
  },
} as const;

/**
 * Check if a user has permission to perform an action
 */
export function hasPermission(userRole: AdminRole | null, permission: PermissionConfig): boolean {
  if (!userRole) return false;
  return permission.allowedRoles.includes(userRole);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasRole(userRole: AdminRole | null, allowedRoles: AdminRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if a user is a super admin
 */
export function isSuperAdmin(userRole: AdminRole | null): boolean {
  return userRole === ADMIN_ROLES.SUPER_ADMIN;
}

/**
 * Check if a user is a content manager or super admin
 */
export function canManageContent(userRole: AdminRole | null): boolean {
  return hasRole(userRole, [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.CONTENT_MANAGER]);
}

/**
 * Check if a user can edit questions (including moderators)
 */
export function canEditQuestions(userRole: AdminRole | null): boolean {
  return hasRole(userRole, [
    ADMIN_ROLES.SUPER_ADMIN,
    ADMIN_ROLES.CONTENT_MANAGER,
    ADMIN_ROLES.MODERATOR,
  ]);
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: AdminRole): string {
  const roleNames: Record<AdminRole, string> = {
    super_admin: 'Super Admin',
    content_manager: 'Content Manager',
    moderator: 'Moderator',
  };
  return roleNames[role] || role;
}
