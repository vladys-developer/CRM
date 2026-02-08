import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Mail,
    Phone,
    MessageCircle,
    Hash,
    Send,
    ArrowLeft,
    Inbox as InboxIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversations, useMessages, useSendMessage } from '@/hooks/useConversations'
import type { ConversationFilters } from '@/lib/api/conversations'

const channelConfig: Record<string, { icon: typeof Mail; color: string; bgColor: string; label: string }> = {
    email: { icon: Mail, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Email' },
    whatsapp: { icon: MessageCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'WhatsApp' },
    phone: { icon: Phone, color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Teléfono' },
    internal: { icon: Hash, color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Interno' },
}

function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function InboxPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [channelFilter, setChannelFilter] = useState<string>('')
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const filters: ConversationFilters = {
        ...(channelFilter ? { channel: channelFilter } : {}),
        ...(search ? { search } : {}),
    }

    const { data: conversations, isLoading: convsLoading } = useConversations(filters)
    const { data: messages, isLoading: msgsLoading } = useMessages(selectedId)
    const sendMutation = useSendMessage()

    const selectedConv = conversations?.find((c) => c.id === selectedId) ?? null

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!newMessage.trim() || !selectedId) return
        sendMutation.mutate({ conversationId: selectedId, content: newMessage.trim() })
        setNewMessage('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-0 rounded-xl border border-border bg-card overflow-hidden">
            {/* Conversation List */}
            <div className={cn(
                'flex flex-col border-r border-border bg-card w-full sm:w-80 lg:w-96 shrink-0',
                selectedId && 'hidden sm:flex'
            )}>
                {/* List Header */}
                <div className="border-b border-border p-4">
                    <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
                    <div className="mt-3 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar conversaciones..."
                                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <select
                            value={channelFilter}
                            onChange={(e) => setChannelFilter(e.target.value)}
                            className="rounded-lg border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="">Todos</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="phone">Teléfono</option>
                            <option value="internal">Interno</option>
                        </select>
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {convsLoading ? (
                        <div className="space-y-1 p-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                                        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (conversations?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="rounded-full bg-muted p-4">
                                <InboxIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-foreground">Sin conversaciones</p>
                            <p className="mt-1 text-xs text-muted-foreground">Las conversaciones aparecerán aquí</p>
                        </div>
                    ) : (
                        <div className="p-1">
                            {conversations?.map((conv) => {
                                const channel = channelConfig[conv.channel] || channelConfig.internal!
                                const ChannelIcon = channel.icon
                                const isActive = selectedId === conv.id
                                const contactName = conv.contact
                                    ? `${conv.contact.first_name} ${conv.contact.last_name}`
                                    : 'Sin contacto'

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedId(conv.id)}
                                        className={cn(
                                            'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors',
                                            isActive ? 'bg-primary/10' : 'hover:bg-accent/50'
                                        )}
                                    >
                                        <div className={cn('rounded-full p-2.5 mt-0.5 shrink-0', channel.bgColor)}>
                                            <ChannelIcon className={cn('h-4 w-4', channel.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium text-foreground truncate">{contactName}</span>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {getTimeAgo(conv.last_message_at)}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                                {conv.subject ?? 'Sin asunto'}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                'flex flex-col flex-1',
                !selectedId && 'hidden sm:flex'
            )}>
                {!selectedId ? (
                    <div className="flex flex-1 flex-col items-center justify-center">
                        <div className="rounded-full bg-muted p-5">
                            <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Selecciona una conversación para empezar
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="sm:hidden rounded-lg p-1 text-muted-foreground hover:bg-accent"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            {selectedConv && (() => {
                                const channel = channelConfig[selectedConv.channel] || channelConfig.internal!
                                const ChannelIcon = channel.icon
                                return (
                                    <>
                                        <div className={cn('rounded-full p-2', channel.bgColor)}>
                                            <ChannelIcon className={cn('h-4 w-4', channel.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {selectedConv.contact
                                                    ? `${selectedConv.contact.first_name} ${selectedConv.contact.last_name}`
                                                    : 'Sin contacto'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{channel.label} · {selectedConv.subject ?? 'Sin asunto'}</p>
                                        </div>
                                        <div className={cn(
                                            'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                            selectedConv.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' :
                                                selectedConv.status === 'closed' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-muted text-muted-foreground'
                                        )}>
                                            {selectedConv.status}
                                        </div>
                                    </>
                                )
                            })()}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {msgsLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                                            <div className={cn('h-12 w-52 animate-pulse rounded-2xl', i % 2 === 0 ? 'bg-muted' : 'bg-primary/20')} />
                                        </div>
                                    ))}
                                </div>
                            ) : (messages?.length ?? 0) === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-xs text-muted-foreground">No hay mensajes en esta conversación</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {messages?.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}
                                        >
                                            <div className={cn(
                                                'max-w-[70%] rounded-2xl px-4 py-2.5',
                                                msg.direction === 'outbound'
                                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                                    : 'bg-accent text-foreground rounded-bl-md'
                                            )}>
                                                {msg.direction === 'inbound' && msg.sender_name && (
                                                    <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.sender_name}</p>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <p className={cn(
                                                    'text-[10px] mt-1',
                                                    msg.direction === 'outbound' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                                )}>
                                                    {new Date(msg.sent_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Compose */}
                        <div className="border-t border-border p-3">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribe un mensaje..."
                                    rows={1}
                                    className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim() || sendMutation.isPending}
                                    className={cn(
                                        'rounded-xl p-2.5 transition-all',
                                        newMessage.trim()
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
