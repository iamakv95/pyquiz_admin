import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService, comprehensionGroupService, type QuestionFilters } from '../services/content.service';
import type { Database } from '../types/database.types';

type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type QuestionUpdate = Database['public']['Tables']['questions']['Update'];
type ComprehensionGroupInsert = Database['public']['Tables']['comprehension_groups']['Insert'];
type ComprehensionGroupUpdate = Database['public']['Tables']['comprehension_groups']['Update'];

// Query keys
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: QuestionFilters) => [...questionKeys.lists(), filters] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
  stats: () => [...questionKeys.all, 'stats'] as const,
};

export const comprehensionKeys = {
  all: ['comprehension_groups'] as const,
  lists: () => [...comprehensionKeys.all, 'list'] as const,
  details: () => [...comprehensionKeys.all, 'detail'] as const,
  detail: (id: string) => [...comprehensionKeys.details(), id] as const,
  questions: (id: string) => [...comprehensionKeys.detail(id), 'questions'] as const,
};

// Questions hooks
export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: questionKeys.list(filters),
    queryFn: () => questionService.getAll(filters),
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => questionService.getById(id),
    enabled: !!id,
  });
}

export function useQuestionStats() {
  return useQuery({
    queryKey: questionKeys.stats(),
    queryFn: () => questionService.getStats(),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: QuestionInsert) => questionService.create(question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuestionUpdate }) =>
      questionService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => questionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
    },
  });
}

export function useBulkDeleteQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => questionService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
    },
  });
}

export function useBulkUpdateDifficulty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, difficulty }: { ids: string[]; difficulty: 'easy' | 'medium' | 'hard' }) =>
      questionService.bulkUpdateDifficulty(ids, difficulty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
    },
  });
}

export function useBulkAssignTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, tagIds }: { ids: string[]; tagIds: string[] }) =>
      questionService.bulkAssignTags(ids, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}

export function useDuplicateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => questionService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
    },
  });
}

// Comprehension groups hooks
export function useComprehensionGroups() {
  return useQuery({
    queryKey: comprehensionKeys.lists(),
    queryFn: () => comprehensionGroupService.getAll(),
  });
}

export function useComprehensionGroup(id: string) {
  return useQuery({
    queryKey: comprehensionKeys.detail(id),
    queryFn: () => comprehensionGroupService.getById(id),
    enabled: !!id,
  });
}

export function useComprehensionGroupQuestions(id: string) {
  return useQuery({
    queryKey: comprehensionKeys.questions(id),
    queryFn: () => comprehensionGroupService.getQuestions(id),
    enabled: !!id,
  });
}

export function useCreateComprehensionGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (group: ComprehensionGroupInsert) => comprehensionGroupService.create(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprehensionKeys.lists() });
    },
  });
}

export function useUpdateComprehensionGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ComprehensionGroupUpdate }) =>
      comprehensionGroupService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: comprehensionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: comprehensionKeys.lists() });
    },
  });
}

export function useDeleteComprehensionGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => comprehensionGroupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprehensionKeys.lists() });
    },
  });
}
