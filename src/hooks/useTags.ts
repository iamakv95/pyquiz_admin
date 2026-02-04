import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagService } from '../services/content.service';
import type { Database } from '../types/database.types';

type TagInsert = Database['public']['Tables']['tags']['Insert'];

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
};

// Tags hooks
export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => tagService.getAll(),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tag: TagInsert) => tagService.create(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}
