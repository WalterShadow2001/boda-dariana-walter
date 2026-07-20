'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRaffleStore } from '@/stores/raffle-store'
import { useWeddingStore } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { SpinWheel } from './SpinWheel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Ticket,
  Plus,
  Trash2,
  Users,
  DollarSign,
  Hash,
  Phone,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Sparkles,
  Search,
} from 'lucide-react'

export function RaffleSection() {
  const colors = useThemeStore((s) => s.colors)
  const { projects, selectedProjectId } = useWeddingStore()
  const {
    raffles,
    isLoading,
    selectedRaffleId,
    loadRaffles,
    createRaffle,
    deleteRaffle,
    addParticipant,
    removeParticipant,
    togglePaid,
    spinWheel,
    resetRaffle,
    selectRaffle,
    getSelectedRaffle,
    getRaffleStats,
  } = useRaffleStore()

  const [isSpinning, setIsSpinning] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [addParticipantOpen, setAddParticipantOpen] = useState(false)
  const [participantNumber, setParticipantNumber] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [searchNumber, setSearchNumber] = useState('')

  // New raffle form
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newTotalNumbers, setNewTotalNumbers] = useState('100')

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedRaffle = getSelectedRaffle()

  // Load raffles when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadRaffles(selectedProjectId)
    }
  }, [selectedProjectId, loadRaffles])

  const handleCreateRaffle = async () => {
    if (!selectedProjectId || !newName || !newAmount) return
    const result = await createRaffle(
      selectedProjectId,
      newName,
      newDescription,
      Number(newAmount),
      Number(newTotalNumbers) || 100
    )
    if (result.success) {
      setIsCreateOpen(false)
      setNewName('')
      setNewDescription('')
      setNewAmount('')
      setNewTotalNumbers('100')
    }
  }

  const handleAddParticipant = async () => {
    if (!selectedRaffleId || !participantNumber || !participantName) return
    const result = await addParticipant(
      selectedRaffleId,
      Number(participantNumber),
      participantName,
      participantPhone
    )
    if (result.success) {
      setParticipantNumber('')
      setParticipantName('')
      setParticipantPhone('')
      setAddParticipantOpen(false)
    } else {
      alert(result.error)
    }
  }

  const handleDeleteRaffle = async () => {
    if (!deleteConfirmId) return
    await deleteRaffle(deleteConfirmId)
    setDeleteConfirmId(null)
  }

  const handleSpinWheel = async () => {
    if (!selectedRaffleId) return null
    return await spinWheel(selectedRaffleId)
  }

  const handleResetRaffle = async () => {
    if (!selectedRaffleId) return
    await resetRaffle(selectedRaffleId)
  }

  const stats = selectedRaffle ? getRaffleStats(selectedRaffle.id) : null

  // Get available numbers for quick assign
  const getAvailableNumbers = () => {
    if (!selectedRaffle) return []
    const taken = new Set(selectedRaffle.participants.map((p) => p.number))
    const available: number[] = []
    for (let i = 1; i <= selectedRaffle.total_numbers; i++) {
      if (!taken.has(i)) available.push(i)
    }
    return available
  }

  const availableNumbers = getAvailableNumbers()

  // Filtered participants
  const filteredParticipants = selectedRaffle
    ? searchNumber
      ? selectedRaffle.participants.filter(
          (p) =>
            p.number.toString().includes(searchNumber) ||
            p.name.toLowerCase().includes(searchNumber.toLowerCase())
        )
      : selectedRaffle.participants
    : []

  if (!selectedProject) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 rounded-2xl"
        style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.borderColor}` }}
      >
        <Ticket size={48} style={{ color: colors.mutedText }} className="mb-4" />
        <p style={{ color: colors.mutedText }}>Selecciona un proyecto para ver las rifas</p>
      </div>
    )
  }

  // Raffle detail view
  if (selectedRaffle) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => selectRaffle(null)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.primaryAccent }}
        >
          <ChevronLeft size={16} />
          Volver a rifas
        </button>

        {/* Raffle header */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, ${colors.secondaryBg})`,
            border: `1px solid ${colors.borderColor}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>
                🎟️ {selectedRaffle.name}
              </h2>
              {selectedRaffle.description && (
                <p className="text-sm mt-1" style={{ color: colors.mutedText }}>
                  {selectedRaffle.description}
                </p>
              )}
            </div>
            <Badge
              style={{
                backgroundColor: selectedRaffle.status === 'completed' ? colors.goldAccent : colors.successColor,
                color: 'white',
              }}
            >
              {selectedRaffle.status === 'completed' ? 'Sorteada' : 'Activa'}
            </Badge>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.primaryBg }}>
                <div className="text-lg font-bold" style={{ color: colors.primaryAccent }}>
                  {stats.soldNumbers}
                </div>
                <div className="text-xs" style={{ color: colors.mutedText }}>Vendidos</div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.primaryBg }}>
                <div className="text-lg font-bold" style={{ color: colors.successColor }}>
                  ${stats.totalAmount.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: colors.mutedText }}>Total</div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.primaryBg }}>
                <div className="text-lg font-bold" style={{ color: colors.goldAccent }}>
                  ${stats.paidAmount.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: colors.mutedText }}>Cobrado</div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.primaryBg }}>
                <div className="text-lg font-bold" style={{ color: colors.mutedText }}>
                  {stats.availableNumbers}
                </div>
                <div className="text-xs" style={{ color: colors.mutedText }}>Disponibles</div>
              </div>
            </div>
          )}

          <div className="text-sm mt-2" style={{ color: colors.secondaryText }}>
            Precio por número: <span className="font-bold" style={{ color: colors.goldAccent }}>${selectedRaffle.amount.toLocaleString()}</span>
            {' · '}Del 1 al {selectedRaffle.total_numbers}
          </div>
        </div>

        {/* Spin Wheel */}
        <div
          className="p-4 rounded-xl flex justify-center"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.borderColor}`,
          }}
        >
          <SpinWheel
            participants={selectedRaffle.participants}
            totalNumbers={selectedRaffle.total_numbers}
            winnerNumber={selectedRaffle.winner_number}
            onSpin={handleSpinWheel}
            onReset={handleResetRaffle}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        </div>

        {/* Add participant button + search */}
        <div className="flex gap-2">
          {selectedRaffle.status === 'active' && (
            <Sheet open={addParticipantOpen} onOpenChange={setAddParticipantOpen}>
              <SheetTrigger asChild>
                <Button
                  className="flex-1"
                  style={{
                    background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.goldAccent})`,
                    color: colors.primaryBg,
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Agregar Participante
                </Button>
              </SheetTrigger>
              <SheetContent
                className="w-full sm:max-w-md"
                style={{ backgroundColor: colors.cardBg, borderLeftColor: colors.borderColor }}
              >
                <SheetHeader>
                  <SheetTitle style={{ color: colors.primaryText }}>
                    🎟️ Agregar Participante
                  </SheetTitle>
                  <SheetDescription style={{ color: colors.mutedText }}>
                    Asigna un número a un participante
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                      <Hash size={14} className="inline mr-1" />
                      Número
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={selectedRaffle.total_numbers}
                      value={participantNumber}
                      onChange={(e) => setParticipantNumber(e.target.value)}
                      placeholder={`1 - ${selectedRaffle.total_numbers}`}
                      style={{
                        borderColor: colors.inputBorder,
                        backgroundColor: colors.primaryBg,
                        color: colors.primaryText,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                      Nombre
                    </label>
                    <Input
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Nombre del participante"
                      style={{
                        borderColor: colors.inputBorder,
                        backgroundColor: colors.primaryBg,
                        color: colors.primaryText,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                      <Phone size={14} className="inline mr-1" />
                      Teléfono (opcional)
                    </label>
                    <Input
                      value={participantPhone}
                      onChange={(e) => setParticipantPhone(e.target.value)}
                      placeholder="Teléfono"
                      style={{
                        borderColor: colors.inputBorder,
                        backgroundColor: colors.primaryBg,
                        color: colors.primaryText,
                      }}
                    />
                  </div>

                  {/* Quick number picker */}
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: colors.secondaryText }}>
                      Números disponibles (click para seleccionar)
                    </label>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 rounded-lg" style={{ backgroundColor: colors.primaryBg }}>
                      {availableNumbers.slice(0, 100).map((num) => (
                        <button
                          key={num}
                          onClick={() => setParticipantNumber(String(num))}
                          className="w-8 h-8 text-xs rounded-md font-medium transition-all hover:scale-110"
                          style={{
                            backgroundColor: participantNumber === String(num) ? colors.primaryAccent : colors.secondaryBg,
                            color: participantNumber === String(num) ? colors.primaryBg : colors.primaryText,
                          }}
                        >
                          {num}
                        </button>
                      ))}
                      {availableNumbers.length > 100 && (
                        <span className="text-xs self-center px-2" style={{ color: colors.mutedText }}>
                          +{availableNumbers.length - 100} más...
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleAddParticipant}
                    disabled={!participantNumber || !participantName}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.goldAccent})`,
                      color: colors.primaryBg,
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Asignar Número {participantNumber && `#${participantNumber}`}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.mutedText }} />
            <Input
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder="Buscar # o nombre..."
              className="pl-9"
              style={{
                borderColor: colors.inputBorder,
                backgroundColor: colors.primaryBg,
                color: colors.primaryText,
              }}
            />
          </div>
        </div>

        {/* Participants grid */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${colors.borderColor}` }}
        >
          <div
            className="p-3 flex items-center justify-between"
            style={{ backgroundColor: colors.secondaryBg }}
          >
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: colors.primaryAccent }} />
              <span className="font-medium text-sm" style={{ color: colors.primaryText }}>
                Participantes ({selectedRaffle.participants.length})
              </span>
            </div>
          </div>

          <ScrollArea className="max-h-64">
            {filteredParticipants.length === 0 ? (
              <div className="p-6 text-center" style={{ color: colors.mutedText }}>
                <Ticket size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay participantes aún</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: colors.borderColor }}>
                {filteredParticipants.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3"
                    style={{
                      backgroundColor: p.number === selectedRaffle.winner_number ? `${colors.goldAccent}15` : 'transparent',
                      borderBottom: `1px solid ${colors.borderColor}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: p.number === selectedRaffle.winner_number ? colors.goldAccent : colors.primaryAccent,
                        color: colors.primaryBg,
                      }}
                    >
                      {p.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: colors.primaryText }}>
                        {p.name}
                        {p.number === selectedRaffle.winner_number && (
                          <span className="ml-1">👑</span>
                        )}
                      </div>
                      {p.phone && (
                        <div className="text-xs" style={{ color: colors.mutedText }}>
                          📞 {p.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => togglePaid(selectedRaffle.id, p.id, !p.is_paid)}
                        className="transition-transform hover:scale-110"
                        title={p.is_paid ? 'Marcar como no pagado' : 'Marcar como pagado'}
                      >
                        {p.is_paid ? (
                          <CheckCircle2 size={20} style={{ color: colors.successColor }} />
                        ) : (
                          <Circle size={20} style={{ color: colors.mutedText }} />
                        )}
                      </button>
                      {selectedRaffle.status === 'active' && (
                        <button
                          onClick={() => removeParticipant(selectedRaffle.id, p.id)}
                          className="transition-transform hover:scale-110"
                          title="Eliminar participante"
                        >
                          <Trash2 size={16} style={{ color: colors.errorColor }} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    )
  }

  // Raffle list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.primaryText }}>
          <Ticket size={20} style={{ color: colors.primaryAccent }} />
          Rifas
        </h2>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              style={{
                background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.goldAccent})`,
                color: colors.primaryBg,
              }}
            >
              <Plus size={14} className="mr-1" />
              Nueva Rifa
            </Button>
          </DialogTrigger>
          <DialogContent style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <DialogHeader>
              <DialogTitle style={{ color: colors.primaryText }}>
                🎟️ Crear Nueva Rifa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                  Nombre de la rifa
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Rifa de la Boda"
                  style={{
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.primaryBg,
                    color: colors.primaryText,
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                  Descripción
                </label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ej: Rifa para la luna de miel"
                  style={{
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.primaryBg,
                    color: colors.primaryText,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                    <DollarSign size={14} className="inline mr-1" />
                    Monto por número
                  </label>
                  <Input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="50"
                    style={{
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.primaryBg,
                      color: colors.primaryText,
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.secondaryText }}>
                    <Hash size={14} className="inline mr-1" />
                    Total números
                  </label>
                  <Input
                    type="number"
                    value={newTotalNumbers}
                    onChange={(e) => setNewTotalNumbers(e.target.value)}
                    placeholder="100"
                    style={{
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.primaryBg,
                      color: colors.primaryText,
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateRaffle}
                disabled={!newName || !newAmount}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.goldAccent})`,
                  color: colors.primaryBg,
                }}
              >
                <Sparkles size={16} className="mr-2" />
                Crear Rifa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Raffle list */}
      {isLoading ? (
        <div className="text-center p-8" style={{ color: colors.mutedText }}>
          Cargando rifas...
        </div>
      ) : raffles.length === 0 ? (
        <div
          className="flex flex-col items-center p-8 rounded-2xl"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.borderColor}` }}
        >
          <Ticket size={48} style={{ color: colors.mutedText }} className="mb-4" />
          <p className="font-medium mb-1" style={{ color: colors.primaryText }}>
            No hay rifas aún
          </p>
          <p className="text-sm" style={{ color: colors.mutedText }}>
            Crea una rifa para empezar a vender números
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {raffles.map((raffle) => {
              const rStats = getRaffleStats(raffle.id)
              return (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.borderColor}`,
                  }}
                  onClick={() => selectRaffle(raffle.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{
                          backgroundColor: raffle.status === 'completed' ? `${colors.goldAccent}20` : `${colors.primaryAccent}20`,
                        }}
                      >
                        {raffle.status === 'completed' ? '🏆' : '🎟️'}
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: colors.primaryText }}>
                          {raffle.name}
                        </div>
                        <div className="text-sm" style={{ color: colors.mutedText }}>
                          ${raffle.amount}/número · {raffle.participants.length}/{raffle.total_numbers} vendidos
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: raffle.status === 'completed' ? colors.goldAccent : colors.successColor,
                          color: raffle.status === 'completed' ? colors.goldAccent : colors.successColor,
                        }}
                      >
                        {raffle.status === 'completed' ? 'Sorteada' : 'Activa'}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmId(raffle.id)
                        }}
                        className="p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} style={{ color: colors.errorColor }} />
                      </button>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-1.5 rounded-md text-xs" style={{ backgroundColor: colors.primaryBg }}>
                      <span className="font-bold" style={{ color: colors.successColor }}>
                        ${rStats.totalAmount.toLocaleString()}
                      </span>
                      <div style={{ color: colors.mutedText }}>Total</div>
                    </div>
                    <div className="text-center p-1.5 rounded-md text-xs" style={{ backgroundColor: colors.primaryBg }}>
                      <span className="font-bold" style={{ color: colors.goldAccent }}>
                        ${rStats.paidAmount.toLocaleString()}
                      </span>
                      <div style={{ color: colors.mutedText }}>Cobrado</div>
                    </div>
                    <div className="text-center p-1.5 rounded-md text-xs" style={{ backgroundColor: colors.primaryBg }}>
                      <span className="font-bold" style={{ color: colors.primaryAccent }}>
                        {rStats.availableNumbers}
                      </span>
                      <div style={{ color: colors.mutedText }}>Disponibles</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.primaryBg }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(raffle.participants.length / raffle.total_numbers) * 100}%`,
                          background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.goldAccent})`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: colors.primaryText }}>
              Eliminar Rifa
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: colors.mutedText }}>
              Esta acción eliminará la rifa y todos sus participantes. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: colors.borderColor, color: colors.secondaryText }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRaffle}
              style={{ backgroundColor: colors.errorColor, color: 'white' }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
