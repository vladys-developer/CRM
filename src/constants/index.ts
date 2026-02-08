export const CONTACT_STATUS_OPTIONS = [
    { value: 'nuevo', label: 'Nuevo', color: '#3B82F6' },
    { value: 'contactado', label: 'Contactado', color: '#8B5CF6' },
    { value: 'calificado', label: 'Calificado', color: '#F59E0B' },
    { value: 'cliente', label: 'Cliente', color: '#10B981' },
    { value: 'inactivo', label: 'Inactivo', color: '#6B7280' },
    { value: 'descartado', label: 'Descartado', color: '#EF4444' },
] as const

export const CONTACT_SOURCE_OPTIONS = [
    { value: 'formulario', label: 'Formulario' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'importacion', label: 'Importación' },
    { value: 'integracion', label: 'Integración' },
    { value: 'referido', label: 'Referido' },
    { value: 'evento', label: 'Evento' },
    { value: 'web', label: 'Web' },
    { value: 'manual', label: 'Manual' },
    { value: 'otro', label: 'Otro' },
] as const

export const PRIORITY_OPTIONS = [
    { value: 'alta', label: 'Alta', color: '#EF4444' },
    { value: 'media', label: 'Media', color: '#F59E0B' },
    { value: 'baja', label: 'Baja', color: '#10B981' },
] as const

export const COMPANY_STATUS_OPTIONS = [
    { value: 'prospecto', label: 'Prospecto', color: '#3B82F6' },
    { value: 'cliente_activo', label: 'Cliente Activo', color: '#10B981' },
    { value: 'cliente_inactivo', label: 'Cliente Inactivo', color: '#6B7280' },
    { value: 'ex_cliente', label: 'Ex-Cliente', color: '#EF4444' },
    { value: 'partner', label: 'Partner', color: '#8B5CF6' },
] as const

export const COMPANY_TYPE_OPTIONS = [
    { value: 'B2B', label: 'B2B' },
    { value: 'B2C', label: 'B2C' },
    { value: 'B2B2C', label: 'B2B2C' },
] as const

export const EMPLOYEE_RANGE_OPTIONS = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' },
] as const

export const OPPORTUNITY_STATUS_OPTIONS = [
    { value: 'abierto', label: 'Abierto', color: '#3B82F6' },
    { value: 'ganado', label: 'Ganado', color: '#10B981' },
    { value: 'perdido', label: 'Perdido', color: '#EF4444' },
    { value: 'descartado', label: 'Descartado', color: '#6B7280' },
] as const

export const OPPORTUNITY_TYPE_OPTIONS = [
    { value: 'nueva_venta', label: 'Nueva Venta' },
    { value: 'upsell', label: 'Upsell' },
    { value: 'cross_sell', label: 'Cross-sell' },
    { value: 'renovacion', label: 'Renovación' },
] as const

export const ACTIVITY_TYPE_OPTIONS = [
    { value: 'tarea', label: 'Tarea', icon: 'CheckSquare', color: '#3B82F6' },
    { value: 'llamada', label: 'Llamada', icon: 'Phone', color: '#10B981' },
    { value: 'email', label: 'Email', icon: 'Mail', color: '#8B5CF6' },
    { value: 'reunion', label: 'Reunión', icon: 'Calendar', color: '#F59E0B' },
    { value: 'nota', label: 'Nota', icon: 'StickyNote', color: '#6B7280' },
] as const

export const ACTIVITY_STATUS_OPTIONS = [
    { value: 'pendiente', label: 'Pendiente', color: '#3B82F6' },
    { value: 'en_progreso', label: 'En Progreso', color: '#F59E0B' },
    { value: 'completada', label: 'Completada', color: '#10B981' },
    { value: 'cancelada', label: 'Cancelada', color: '#EF4444' },
    { value: 'pospuesta', label: 'Pospuesta', color: '#6B7280' },
] as const

export const CLIENT_TIER_OPTIONS = [
    { value: 'platinum', label: 'Platinum', color: '#E5E7EB' },
    { value: 'gold', label: 'Gold', color: '#F59E0B' },
    { value: 'silver', label: 'Silver', color: '#9CA3AF' },
    { value: 'bronze', label: 'Bronze', color: '#B45309' },
] as const

export const USER_ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Administrador' },
    { value: 'sales_manager', label: 'Gerente de Ventas' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'marketing_manager', label: 'Gerente de Marketing' },
    { value: 'marketing_user', label: 'Marketing' },
    { value: 'soporte', label: 'Soporte' },
    { value: 'ejecutivo', label: 'Ejecutivo' },
    { value: 'partner', label: 'Partner' },
] as const

export const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/contacts', label: 'Contactos', icon: 'Users' },
    { path: '/companies', label: 'Empresas', icon: 'Building2' },
    { path: '/opportunities', label: 'Oportunidades', icon: 'Target' },
    { path: '/pipeline', label: 'Pipeline', icon: 'Kanban' },
    { path: '/activities', label: 'Actividades', icon: 'CheckSquare' },
    { path: '/inbox', label: 'Inbox', icon: 'Inbox', badge: true },
    { path: '/calendar', label: 'Calendario', icon: 'Calendar' },
    { path: '/reports', label: 'Reportes', icon: 'BarChart3' },
    { path: '/settings', label: 'Ajustes', icon: 'Settings' },
] as const
