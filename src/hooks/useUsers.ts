import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserFilters } from '../services/user.service';
import type { Database } from '../types/database.types';

type UserUpdate = Database['public']['Tables']['users']['Update'];

export const useUsers = (filters: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

export const useUserStatistics = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'statistics'],
    queryFn: () => userService.getUserStatistics(userId),
    enabled: !!userId,
  });
};

export const useUserActivity = (userId: string, limit = 10) => {
  return useQuery({
    queryKey: ['users', userId, 'activity', limit],
    queryFn: () => userService.getUserActivity(userId, limit),
    enabled: !!userId,
  });
};

export const useUserAttempts = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'attempts'],
    queryFn: () => userService.getUserAttempts(userId),
    enabled: !!userId,
  });
};

export const useUserReports = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'reports'],
    queryFn: () => userService.getUserReports(userId),
    enabled: !!userId,
  });
};

export const useUserFeedback = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'feedback'],
    queryFn: () => userService.getUserFeedback(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UserUpdate }) =>
      userService.updateUser(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', data.id], data);
    },
  });
};

export const useExportUsers = () => {
  return useMutation({
    mutationFn: (filters: UserFilters) => userService.exportUsers(filters),
  });
};
