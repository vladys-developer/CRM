import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    deleteCompanies,
    type CompanyFilters,
} from '@/lib/api/companies'
import type { InsertTables, UpdateTables } from '@/types/database'

const COMPANIES_KEY = 'companies'

export function useCompanies(
    filters: CompanyFilters = {},
    pagination = { page: 1, pageSize: 25, sortBy: 'created_at', sortOrder: 'desc' as const }
) {
    return useQuery({
        queryKey: [COMPANIES_KEY, filters, pagination],
        queryFn: () => getCompanies(filters, pagination),
    })
}

export function useCompany(id: string | undefined) {
    return useQuery({
        queryKey: [COMPANIES_KEY, id],
        queryFn: () => getCompany(id!),
        enabled: !!id,
    })
}

export function useCreateCompany() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (company: InsertTables<'companies'>) => createCompany(company),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] })
            toast.success('Empresa creada correctamente')
        },
        onError: (error: Error) => {
            toast.error('Error al crear empresa', { description: error.message })
        },
    })
}

export function useUpdateCompany() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateTables<'companies'> }) =>
            updateCompany(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] })
            queryClient.setQueryData([COMPANIES_KEY, data.id], data)
            toast.success('Empresa actualizada')
        },
        onError: (error: Error) => {
            toast.error('Error al actualizar empresa', { description: error.message })
        },
    })
}

export function useDeleteCompany() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] })
            toast.success('Empresa eliminada')
        },
        onError: (error: Error) => {
            toast.error('Error al eliminar empresa', { description: error.message })
        },
    })
}

export function useDeleteCompanies() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (ids: string[]) => deleteCompanies(ids),
        onSuccess: (_data, ids) => {
            queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] })
            toast.success(`${ids.length} empresa(s) eliminada(s)`)
        },
        onError: (error: Error) => {
            toast.error('Error al eliminar empresas', { description: error.message })
        },
    })
}
