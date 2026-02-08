import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    deleteContacts,
    type ContactFilters,
    type PaginationParams,
} from '@/lib/api/contacts'
import type { InsertTables, UpdateTables } from '@/types/database'

const CONTACTS_KEY = 'contacts'

export function useContacts(
    filters: ContactFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 25 }
) {
    return useQuery({
        queryKey: [CONTACTS_KEY, filters, pagination],
        queryFn: () => getContacts(filters, pagination),
    })
}

export function useContact(id: string | undefined) {
    return useQuery({
        queryKey: [CONTACTS_KEY, id],
        queryFn: () => getContact(id!),
        enabled: !!id,
    })
}

export function useCreateContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (contact: InsertTables<'contacts'>) => createContact(contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONTACTS_KEY] })
            toast.success('Contacto creado correctamente')
        },
        onError: (error: Error) => {
            toast.error('Error al crear contacto', { description: error.message })
        },
    })
}

export function useUpdateContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateTables<'contacts'> }) =>
            updateContact(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [CONTACTS_KEY] })
            queryClient.setQueryData([CONTACTS_KEY, data.id], data)
            toast.success('Contacto actualizado')
        },
        onError: (error: Error) => {
            toast.error('Error al actualizar contacto', { description: error.message })
        },
    })
}

export function useDeleteContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteContact(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONTACTS_KEY] })
            toast.success('Contacto eliminado')
        },
        onError: (error: Error) => {
            toast.error('Error al eliminar contacto', { description: error.message })
        },
    })
}

export function useDeleteContacts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => deleteContacts(ids),
        onSuccess: (_data, ids) => {
            queryClient.invalidateQueries({ queryKey: [CONTACTS_KEY] })
            toast.success(`${ids.length} contacto(s) eliminado(s)`)
        },
        onError: (error: Error) => {
            toast.error('Error al eliminar contactos', { description: error.message })
        },
    })
}
