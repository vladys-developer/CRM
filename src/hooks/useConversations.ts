import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConversations, getMessages, sendMessage, type ConversationFilters } from '@/lib/api/conversations'

const conversationKeys = {
    all: ['conversations'] as const,
    list: (filters: ConversationFilters) => [...conversationKeys.all, 'list', filters] as const,
    messages: (id: string) => [...conversationKeys.all, 'messages', id] as const,
}

export function useConversations(filters: ConversationFilters = {}) {
    return useQuery({
        queryKey: conversationKeys.list(filters),
        queryFn: () => getConversations(filters),
        refetchInterval: 30_000,
    })
}

export function useMessages(conversationId: string | null) {
    return useQuery({
        queryKey: conversationKeys.messages(conversationId ?? ''),
        queryFn: () => getMessages(conversationId!),
        enabled: !!conversationId,
        refetchInterval: 10_000,
    })
}

export function useSendMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
            sendMessage(conversationId, content),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: conversationKeys.messages(variables.conversationId) })
            queryClient.invalidateQueries({ queryKey: conversationKeys.all })
        },
    })
}
