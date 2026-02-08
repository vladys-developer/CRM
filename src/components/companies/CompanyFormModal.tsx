import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies'
import type { Company } from '@/lib/api/companies'

interface CompanyFormModalProps {
    company?: Company
    onClose: () => void
}

export function CompanyFormModal({ company, onClose }: CompanyFormModalProps) {
    const isEditing = !!company
    const createCompany = useCreateCompany()
    const updateCompany = useUpdateCompany()
    const isSubmitting = createCompany.isPending || updateCompany.isPending

    const [form, setForm] = useState({
        legal_name: company?.legal_name ?? '',
        commercial_name: company?.commercial_name ?? '',
        nif_cif: company?.nif_cif ?? '',
        industry: company?.industry ?? '',
        subsector: company?.subsector ?? '',
        type: company?.type ?? '',
        employee_range: company?.employee_range ?? '',
        founded_year: company?.founded_year?.toString() ?? '',
        annual_revenue: company?.annual_revenue?.toString() ?? '',
        phone: company?.phone ?? '',
        email: company?.email ?? '',
        website: company?.website ?? '',
        status: company?.status ?? 'prospecto',
        client_type: company?.client_type ?? '',
        tier: company?.tier ?? '',
        territory: company?.territory ?? '',
    })

    const updateField = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }))

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.legal_name.trim()) return

        const payload = {
            legal_name: form.legal_name.trim(),
            commercial_name: form.commercial_name.trim() || null,
            nif_cif: form.nif_cif.trim() || null,
            industry: form.industry.trim() || null,
            subsector: form.subsector.trim() || null,
            type: form.type || null,
            employee_range: form.employee_range || null,
            founded_year: form.founded_year ? parseInt(form.founded_year) : null,
            annual_revenue: form.annual_revenue ? parseFloat(form.annual_revenue) : null,
            phone: form.phone.trim() || null,
            email: form.email.trim() || null,
            website: form.website.trim() || null,
            status: form.status,
            client_type: form.client_type || null,
            tier: form.tier || null,
            territory: form.territory.trim() || null,
        }

        if (isEditing) {
            await updateCompany.mutateAsync({ id: company.id, updates: payload })
        } else {
            await createCompany.mutateAsync(payload as any)
        }
        onClose()
    }

    const FieldInput = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <input type={type} value={(form as any)[field]} onChange={(e) => updateField(field, e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
        </div>
    )

    const FieldSelect = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <select value={(form as any)[field]} onChange={(e) => updateField(field, e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary">
                <option value="">Seleccionar...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-[5vh] pb-10"
                onClick={onClose}>

                <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: 'spring', duration: 0.4 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
                        </h2>
                        <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {/* Datos Principales */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-foreground">Datos Principales</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <FieldInput label="Razón Social *" field="legal_name" placeholder="Empresa S.L." />
                                <FieldInput label="Nombre Comercial" field="commercial_name" placeholder="MiEmpresa" />
                                <FieldInput label="CIF / NIF" field="nif_cif" placeholder="B12345678" />
                                <FieldInput label="Industria" field="industry" placeholder="Tecnología" />
                                <FieldInput label="Subsector" field="subsector" placeholder="SaaS" />
                                <FieldInput label="Territorio" field="territory" placeholder="Madrid" />
                            </div>
                        </div>

                        {/* Clasificación */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-foreground">Clasificación</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <FieldSelect label="Estado" field="status" options={[
                                    { value: 'prospecto', label: 'Prospecto' },
                                    { value: 'cliente_activo', label: 'Cliente Activo' },
                                    { value: 'cliente_inactivo', label: 'Inactivo' },
                                    { value: 'ex_cliente', label: 'Ex-Cliente' },
                                    { value: 'partner', label: 'Partner' },
                                ]} />
                                <FieldSelect label="Tipo" field="type" options={[
                                    { value: 'B2B', label: 'B2B' },
                                    { value: 'B2C', label: 'B2C' },
                                    { value: 'B2B2C', label: 'B2B2C' },
                                ]} />
                                <FieldSelect label="Tier" field="tier" options={[
                                    { value: 'platinum', label: 'Platinum' },
                                    { value: 'gold', label: 'Gold' },
                                    { value: 'silver', label: 'Silver' },
                                    { value: 'bronze', label: 'Bronze' },
                                ]} />
                                <FieldSelect label="Tipo Cliente" field="client_type" options={[
                                    { value: 'pequeño', label: 'Pequeño' },
                                    { value: 'mediano', label: 'Mediano' },
                                    { value: 'estratégico', label: 'Estratégico' },
                                    { value: 'enterprise', label: 'Enterprise' },
                                ]} />
                                <FieldSelect label="Empleados" field="employee_range" options={[
                                    { value: '1-10', label: '1-10' },
                                    { value: '11-50', label: '11-50' },
                                    { value: '51-200', label: '51-200' },
                                    { value: '201-500', label: '201-500' },
                                    { value: '500+', label: '500+' },
                                ]} />
                                <FieldInput label="Año de Fundación" field="founded_year" type="number" placeholder="2020" />
                            </div>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-foreground">Contacto Corporativo</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <FieldInput label="Email" field="email" type="email" placeholder="info@empresa.com" />
                                <FieldInput label="Teléfono" field="phone" type="tel" placeholder="+34 900 000 000" />
                                <FieldInput label="Web" field="website" placeholder="https://empresa.com" />
                                <FieldInput label="Facturación Anual" field="annual_revenue" type="number" placeholder="1000000" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                            <button type="button" onClick={onClose}
                                className="h-9 rounded-lg border border-input px-4 text-sm font-medium text-foreground hover:bg-accent">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting || !form.legal_name.trim()}
                                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isEditing ? 'Guardar cambios' : 'Crear empresa'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
