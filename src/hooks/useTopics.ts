import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicService, subtopicService } from '../services/content.service';
import type { Database } from '../types/database.types';

type TopicInsert = Database['public']['Tables']['topics']['Insert'];
type TopicUpdate = Database['public']['Tables']['topics']['Update'];
type SubtopicInsert = Database['public']['Tables']['subtopics']['Insert'];
type SubtopicUpdate = Database['public']['Tables']['subtopics']['Update'];

// Query keys
export const topicKeys = {
  all: ['topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (subjectId?: string) => [...topicKeys.lists(), { subjectId }] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
};

export const subtopicKeys = {
  all: ['subtopics'] as const,
  lists: () => [...subtopicKeys.all, 'list'] as const,
  list: (topicId?: string) => [...subtopicKeys.lists(), { topicId }] as const,
  details: () => [...subtopicKeys.all, 'detail'] as const,
  detail: (id: string) => [...subtopicKeys.details(), id] as const,
};

// Topics hooks
export function useTopics(subjectId?: string) {
  return useQuery({
    queryKey: topicKeys.list(subjectId),
    queryFn: () => (subjectId ? topicService.getBySubject(subjectId) : topicService.getAll()),
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => topicService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topic: TopicInsert) => topicService.create(topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopicUpdate }) =>
      topicService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: topicKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}

// Subtopics hooks
export function useSubtopics(topicId?: string) {
  return useQuery({
    queryKey: subtopicKeys.list(topicId),
    queryFn: () => (topicId ? subtopicService.getByTopic(topicId) : subtopicService.getAll()),
  });
}

export function useSubtopic(id: string) {
  return useQuery({
    queryKey: subtopicKeys.detail(id),
    queryFn: () => subtopicService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subtopic: SubtopicInsert) => subtopicService.create(subtopic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subtopicKeys.lists() });
    },
  });
}

export function useUpdateSubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubtopicUpdate }) =>
      subtopicService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subtopicKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: subtopicKeys.lists() });
    },
  });
}

export function useDeleteSubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subtopicService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subtopicKeys.lists() });
    },
  });
}
