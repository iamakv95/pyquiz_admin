import { describe, it, expect } from 'vitest';
import {
  PERMISSIONS,
  hasPermission,
  hasRole,
  isSuperAdmin,
  canManageContent,
  canEditQuestions,
  getRoleDisplayName,
} from '../permissions';
import { ADMIN_ROLES } from '../constants';

describe('permissions utilities', () => {
  describe('hasPermission', () => {
    it('should allow super admin to view dashboard', () => {
      expect(hasPermission('super_admin', PERMISSIONS.VIEW_DASHBOARD)).toBe(true);
    });

    it('should allow content manager to view dashboard', () => {
      expect(hasPermission('content_manager', PERMISSIONS.VIEW_DASHBOARD)).toBe(true);
    });

    it('should allow moderator to view dashboard', () => {
      expect(hasPermission('moderator', PERMISSIONS.VIEW_DASHBOARD)).toBe(true);
    });

    it('should not allow null role', () => {
      expect(hasPermission(null, PERMISSIONS.VIEW_DASHBOARD)).toBe(false);
    });

    it('should allow super admin to create content', () => {
      expect(hasPermission('super_admin', PERMISSIONS.CREATE_CONTENT)).toBe(true);
    });

    it('should allow content manager to create content', () => {
      expect(hasPermission('content_manager', PERMISSIONS.CREATE_CONTENT)).toBe(true);
    });

    it('should not allow moderator to create content', () => {
      expect(hasPermission('moderator', PERMISSIONS.CREATE_CONTENT)).toBe(false);
    });

    it('should only allow super admin to view users', () => {
      expect(hasPermission('super_admin', PERMISSIONS.VIEW_USERS)).toBe(true);
      expect(hasPermission('content_manager', PERMISSIONS.VIEW_USERS)).toBe(false);
      expect(hasPermission('moderator', PERMISSIONS.VIEW_USERS)).toBe(false);
    });

    it('should only allow super admin to manage admins', () => {
      expect(hasPermission('super_admin', PERMISSIONS.CREATE_ADMINS)).toBe(true);
      expect(hasPermission('content_manager', PERMISSIONS.CREATE_ADMINS)).toBe(false);
      expect(hasPermission('moderator', PERMISSIONS.CREATE_ADMINS)).toBe(false);
    });

    it('should allow all roles to view reports', () => {
      expect(hasPermission('super_admin', PERMISSIONS.VIEW_REPORTS)).toBe(true);
      expect(hasPermission('content_manager', PERMISSIONS.VIEW_REPORTS)).toBe(true);
      expect(hasPermission('moderator', PERMISSIONS.VIEW_REPORTS)).toBe(true);
    });

    it('should allow moderator to edit questions', () => {
      expect(hasPermission('moderator', PERMISSIONS.EDIT_QUESTIONS)).toBe(true);
    });

    it('should not allow moderator to delete questions', () => {
      expect(hasPermission('moderator', PERMISSIONS.DELETE_QUESTIONS)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has one of the allowed roles', () => {
      expect(hasRole('super_admin', ['super_admin', 'content_manager'])).toBe(true);
      expect(hasRole('content_manager', ['super_admin', 'content_manager'])).toBe(true);
    });

    it('should return false if user does not have allowed role', () => {
      expect(hasRole('moderator', ['super_admin', 'content_manager'])).toBe(false);
    });

    it('should return false for null role', () => {
      expect(hasRole(null, ['super_admin'])).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true for super admin', () => {
      expect(isSuperAdmin('super_admin')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isSuperAdmin('content_manager')).toBe(false);
      expect(isSuperAdmin('moderator')).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
    });
  });

  describe('canManageContent', () => {
    it('should return true for super admin', () => {
      expect(canManageContent('super_admin')).toBe(true);
    });

    it('should return true for content manager', () => {
      expect(canManageContent('content_manager')).toBe(true);
    });

    it('should return false for moderator', () => {
      expect(canManageContent('moderator')).toBe(false);
    });

    it('should return false for null role', () => {
      expect(canManageContent(null)).toBe(false);
    });
  });

  describe('canEditQuestions', () => {
    it('should return true for super admin', () => {
      expect(canEditQuestions('super_admin')).toBe(true);
    });

    it('should return true for content manager', () => {
      expect(canEditQuestions('content_manager')).toBe(true);
    });

    it('should return true for moderator', () => {
      expect(canEditQuestions('moderator')).toBe(true);
    });

    it('should return false for null role', () => {
      expect(canEditQuestions(null)).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return display name for super admin', () => {
      expect(getRoleDisplayName('super_admin')).toBe('Super Admin');
    });

    it('should return display name for content manager', () => {
      expect(getRoleDisplayName('content_manager')).toBe('Content Manager');
    });

    it('should return display name for moderator', () => {
      expect(getRoleDisplayName('moderator')).toBe('Moderator');
    });
  });

  describe('PERMISSIONS constants', () => {
    it('should have correct roles for content management', () => {
      expect(PERMISSIONS.CREATE_CONTENT.allowedRoles).toContain(ADMIN_ROLES.SUPER_ADMIN);
      expect(PERMISSIONS.CREATE_CONTENT.allowedRoles).toContain(ADMIN_ROLES.CONTENT_MANAGER);
      expect(PERMISSIONS.CREATE_CONTENT.allowedRoles).not.toContain(ADMIN_ROLES.MODERATOR);
    });

    it('should have correct roles for user management', () => {
      expect(PERMISSIONS.VIEW_USERS.allowedRoles).toEqual([ADMIN_ROLES.SUPER_ADMIN]);
      expect(PERMISSIONS.EDIT_USERS.allowedRoles).toEqual([ADMIN_ROLES.SUPER_ADMIN]);
    });

    it('should have correct roles for analytics', () => {
      expect(PERMISSIONS.VIEW_ANALYTICS.allowedRoles).toHaveLength(3);
      expect(PERMISSIONS.EXPORT_ANALYTICS.allowedRoles).toHaveLength(2);
    });

    it('should have correct roles for admin management', () => {
      expect(PERMISSIONS.CREATE_ADMINS.allowedRoles).toEqual([ADMIN_ROLES.SUPER_ADMIN]);
      expect(PERMISSIONS.DELETE_ADMINS.allowedRoles).toEqual([ADMIN_ROLES.SUPER_ADMIN]);
    });
  });
});
