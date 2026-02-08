import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Bell,
    Palette,
    Shield,
    Database,
    Moon,
    Sun,
    Monitor,
    Globe,
    ChevronRight,
    Save,
    Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

type Tab = 'profile' | 'notifications' | 'appearance' | 'pipeline' | 'security'

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'pipeline', label: 'Pipeline', icon: Database },
    { id: 'security', label: 'Seguridad', icon: Shield },
]

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración</h1>
                <p className="text-sm text-muted-foreground">Gestiona las preferencias de tu CRM</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Sidebar */}
                <div className="rounded-xl border border-border bg-card p-2">
                    <nav className="space-y-0.5">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    <ChevronRight className={cn('ml-auto h-4 w-4 transition-transform', activeTab === tab.id && 'rotate-90')} />
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'appearance' && <AppearanceSettings />}
                        {activeTab === 'pipeline' && <PipelineSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                    </motion.div>

                    {/* Save Button */}
                    <div className="mt-8 flex justify-end border-t border-border pt-4">
                        <button
                            onClick={handleSave}
                            className={cn(
                                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
                                saved
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            )}
                        >
                            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {saved ? 'Guardado' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Profile ─────────────────────────────────────────────────
function ProfileSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
                <p className="text-sm text-muted-foreground mt-1">Información de tu cuenta</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <button className="text-sm font-medium text-primary hover:text-primary/80">
                        Cambiar foto
                    </button>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG. Max 2MB</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Nombre" defaultValue="Admin" />
                <FormField label="Apellido" defaultValue="Usuario" />
                <FormField label="Email" defaultValue="admin@vendora.com" type="email" />
                <FormField label="Teléfono" defaultValue="+34 600 000 000" />
                <FormField label="Cargo" defaultValue="Director Comercial" />
                <FormField label="Departamento" defaultValue="Ventas" />
            </div>
        </div>
    )
}

// ─── Notifications ───────────────────────────────────────────
function NotificationSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
                <p className="text-sm text-muted-foreground mt-1">Configura las alertas que recibes</p>
            </div>

            <div className="space-y-3">
                {[
                    { label: 'Nuevas oportunidades', desc: 'Cuando se crea una oportunidad', defaultOn: true },
                    { label: 'Actividades vencidas', desc: 'Alertas de tareas sin completar', defaultOn: true },
                    { label: 'Deals cerrados', desc: 'Notificación al ganar o perder un deal', defaultOn: true },
                    { label: 'Nuevos contactos', desc: 'Cuando se agrega un contacto', defaultOn: false },
                    { label: 'Cambios en pipeline', desc: 'Movimiento de oportunidades entre etapas', defaultOn: true },
                    { label: 'Resumen semanal', desc: 'Recibe un email con tu resumen de ventas', defaultOn: false },
                ].map((item) => (
                    <ToggleRow
                        key={item.label}
                        label={item.label}
                        description={item.desc}
                        defaultChecked={item.defaultOn}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Appearance ──────────────────────────────────────────────
function AppearanceSettings() {
    const theme = useUIStore((s) => s.theme)
    const setTheme = useUIStore((s) => s.setTheme)

    const themes = [
        { id: 'light' as const, label: 'Claro', icon: Sun },
        { id: 'dark' as const, label: 'Oscuro', icon: Moon },
        { id: 'system' as const, label: 'Sistema', icon: Monitor },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Apariencia</h2>
                <p className="text-sm text-muted-foreground mt-1">Personaliza el aspecto visual</p>
            </div>

            <div>
                <label className="text-sm font-medium text-foreground">Tema</label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                    {themes.map((t) => {
                        const Icon = t.icon
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                                    theme === t.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/30'
                                )}
                            >
                                <Icon className={cn('h-6 w-6', theme === t.id ? 'text-primary' : 'text-muted-foreground')} />
                                <span className="text-sm font-medium">{t.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-foreground">Idioma</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Español (España)</span>
                </div>
            </div>
        </div>
    )
}

// ─── Pipeline ────────────────────────────────────────────────
function PipelineSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Pipeline</h2>
                <p className="text-sm text-muted-foreground mt-1">Configura las etapas de tu embudo de ventas</p>
            </div>

            <p className="text-sm text-muted-foreground">
                Las etapas del pipeline se gestionan directamente desde la vista de Pipeline.
                Desde aquí puedes configurar reglas automáticas.
            </p>

            <div className="space-y-3">
                {[
                    { label: 'Auto-mover a "Cerrada" al ganar', desc: 'Mover oportunidad automáticamente', defaultOn: true },
                    { label: 'Alerta de deals estancados', desc: 'Notificar deals sin actividad en 7+ días', defaultOn: true },
                    { label: 'Probabilidad automática', desc: 'Calcular probabilidad según etapa', defaultOn: false },
                ].map((item) => (
                    <ToggleRow
                        key={item.label}
                        label={item.label}
                        description={item.desc}
                        defaultChecked={item.defaultOn}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Security ────────────────────────────────────────────────
function SecuritySettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Seguridad</h2>
                <p className="text-sm text-muted-foreground mt-1">Protege tu cuenta</p>
            </div>

            <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Autenticación de dos factores</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Añade una capa extra de seguridad</p>
                    </div>
                    <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                        Activar
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Última actualización: hace 30 días</p>
                    </div>
                    <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                        Cambiar
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Zona de peligro</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Estas acciones son irreversibles</p>
                <button className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                    Eliminar Cuenta
                </button>
            </div>
        </div>
    )
}

// ─── Shared Components ───────────────────────────────────────
function FormField({ label, defaultValue, type = 'text' }: { label: string; defaultValue: string; type?: string }) {
    return (
        <div>
            <label className="text-sm font-medium text-foreground">{label}</label>
            <input
                type={type}
                defaultValue={defaultValue}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
        </div>
    )
}

function ToggleRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
    const [enabled, setEnabled] = useState(defaultChecked)

    return (
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <button
                onClick={() => setEnabled(!enabled)}
                className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    enabled ? 'bg-primary' : 'bg-muted'
                )}
            >
                <span className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    enabled ? 'translate-x-5' : 'translate-x-0.5'
                )} />
            </button>
        </div>
    )
}
