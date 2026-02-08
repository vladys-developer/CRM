import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts'
import { useAuth } from '@/hooks/useAuth'
import { CONTACT_STATUS_OPTIONS, CONTACT_SOURCE_OPTIONS, PRIORITY_OPTIONS } from '@/constants'
import type { Contact, InsertTables, UpdateTables } from '@/types/database'

interface ContactFormModalProps {
    contact?: Contact
    onClose: () => void
}

export function ContactFormModal({ contact, onClose }: ContactFormModalProps) {
    const { profile } = useAuth()
    const createContact = useCreateContact()
    const updateContact = useUpdateContact()
    const isEditing = !!contact

    const [formData, setFormData] = useState({
        first_name: contact?.first_name ?? '',
        last_name: contact?.last_name ?? '',
        email: contact?.email ?? '',
        email_secondary: contact?.email_secondary ?? '',
        phone_mobile: contact?.phone_mobile ?? '',
        phone_landline: contact?.phone_landline ?? '',
        phone_whatsapp: contact?.phone_whatsapp ?? '',
        job_title: contact?.job_title ?? '',
        department: contact?.department ?? '',
        source: contact?.source ?? 'directo',
        status: contact?.status ?? 'nuevo',
        priority: contact?.priority ?? 'media',
        preferred_language: contact?.preferred_language ?? 'es',
        notes: contact?.notes ?? '',
        address_street: contact?.address_street ?? '',
        address_city: contact?.address_city ?? '',
        address_state: contact?.address_state ?? '',
        address_postal_code: contact?.address_postal_code ?? '',
        address_country: contact?.address_country ?? 'ES',
    })

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEditing) {
                await updateContact.mutateAsync({
                    id: contact.id,
                    updates: formData as UpdateTables<'contacts'>,
                })
            } else {
                await createContact.mutateAsync({
                    ...formData,
                    team_id: profile?.team_id ?? '',
                    owner_id: profile?.id ?? '',
                } as InsertTables<'contacts'>)
            }
            onClose()
        } catch {
            // Error handled by mutation hooks
        }
    }

    const isSubmitting = createContact.isPending || updateContact.isPending

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-foreground">Información Personal</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FieldInput label="Nombre *" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                    <FieldInput label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange} />
                                    <FieldInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                                    <FieldInput label="Email secundario" name="email_secondary" type="email" value={formData.email_secondary} onChange={handleChange} />
                                    <FieldInput label="Móvil" name="phone_mobile" value={formData.phone_mobile} onChange={handleChange} />
                                    <FieldInput label="Teléfono fijo" name="phone_landline" value={formData.phone_landline} onChange={handleChange} />
                                    <FieldInput label="WhatsApp" name="phone_whatsapp" value={formData.phone_whatsapp} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Professional */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-foreground">Información Profesional</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FieldInput label="Cargo" name="job_title" value={formData.job_title} onChange={handleChange} />
                                    <FieldInput label="Departamento" name="department" value={formData.department} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Classification */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-foreground">Clasificación</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <FieldSelect label="Estado" name="status" value={formData.status} onChange={handleChange} options={CONTACT_STATUS_OPTIONS} />
                                    <FieldSelect label="Fuente" name="source" value={formData.source} onChange={handleChange} options={CONTACT_SOURCE_OPTIONS} />
                                    <FieldSelect label="Prioridad" name="priority" value={formData.priority} onChange={handleChange} options={PRIORITY_OPTIONS} />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-foreground">Dirección</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <FieldInput label="Calle" name="address_street" value={formData.address_street} onChange={handleChange} />
                                    </div>
                                    <FieldInput label="Ciudad" name="address_city" value={formData.address_city} onChange={handleChange} />
                                    <FieldInput label="Provincia" name="address_state" value={formData.address_state} onChange={handleChange} />
                                    <FieldInput label="Código Postal" name="address_postal_code" value={formData.address_postal_code} onChange={handleChange} />
                                    <FieldInput label="País" name="address_country" value={formData.address_country} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-foreground">Notas</h3>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
                                    placeholder="Notas adicionales..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.first_name}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isEditing ? 'Guardar Cambios' : 'Crear Contacto'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

// Reusable field components
function FieldInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    required,
}: {
    label: string
    name: string
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
        </div>
    )
}

function FieldSelect({
    label,
    name,
    value,
    onChange,
    options,
}: {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: readonly { value: string; label: string }[]
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
