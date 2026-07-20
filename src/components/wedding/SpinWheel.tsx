'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { useThemeStore } from '@/stores/theme-store'
import type { RaffleParticipant } from '@/stores/raffle-store'

interface SpinWheelProps {
  participants: RaffleParticipant[]
  totalNumbers: number
  winnerNumber: number | null
  onSpin: () => Promise<{ number: number; name: string } | null>
  onReset: () => Promise<void>
  isSpinning: boolean
  setIsSpinning: (v: boolean) => void
}

const WHEEL_COLORS = [
  '#D4A5A5', '#E8C4C4', '#B8D4E3', '#C4E8D4', '#E8D4C4',
  '#D4C4E8', '#E8E8C4', '#C4D4E8', '#E8C4D4', '#C4E8E8',
]

export function SpinWheel({
  participants,
  totalNumbers,
  winnerNumber,
  onSpin,
  onReset,
  isSpinning,
  setIsSpinning,
}: SpinWheelProps) {
  const colors = useThemeStore((s) => s.colors)
  const [result, setResult] = useState<{ number: number; name: string } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [scope, animate] = useAnimate()

  const hasWinner = winnerNumber !== null

  const handleSpin = useCallback(async () => {
    if (isSpinning || participants.length === 0) return

    setIsSpinning(true)
    setResult(null)

    // Call the API to get the winner
    const winner = await onSpin()

    if (winner) {
      // Calculate the target angle for the winner
      // We want the pointer (top) to point to the winner's segment
      const segmentAngle = 360 / totalNumbers
      const targetSegmentCenter = winner.number * segmentAngle - segmentAngle / 2
      const targetRotation = 360 * (5 + Math.random() * 3) + (360 - targetSegmentCenter)

      // Animate the wheel
      animate(scope.current, { rotate: targetRotation }, { duration: 4, ease: 'easeOut' })
      setRotation(targetRotation)

      // Show result after animation
      setTimeout(() => {
        setResult(winner)
        setIsSpinning(false)
      }, 4500)
    } else {
      setIsSpinning(false)
    }
  }, [isSpinning, participants, totalNumbers, onSpin, animate, scope])

  // Generate wheel segments
  const segments = []
  const segmentAngle = 360 / totalNumbers
  const displaySegments = Math.min(totalNumbers, 50) // Limit visual segments for performance
  const visualSegmentAngle = 360 / displaySegments

  for (let i = 0; i < displaySegments; i++) {
    const num = i + 1
    const startAngle = i * visualSegmentAngle
    const participant = participants.find((p) => p.number === num)
    const isWinner = winnerNumber === num
    const fillColor = isWinner
      ? '#D4AF37'
      : participant
        ? colors.primaryAccent
        : WHEEL_COLORS[i % WHEEL_COLORS.length]

    segments.push(
      <g key={i} transform={`rotate(${startAngle})`}>
        <path
          d={`M0,0 L${Math.cos(((visualSegmentAngle / 2) * Math.PI) / 180) * 140},${Math.sin(((visualSegmentAngle / 2) * Math.PI) / 180) * 140} A140,140 0 0,1 ${Math.cos(((visualSegmentAngle) * Math.PI) / 180) * 140},${Math.sin(((visualSegmentAngle) * Math.PI) / 180) * 140} Z`}
          fill={fillColor}
          stroke="white"
          strokeWidth="0.5"
          opacity={participant ? 1 : 0.4}
        />
        {displaySegments <= 30 && (
          <text
            x="95"
            y="2"
            fontSize="7"
            fill={isWinner ? 'white' : '#4A3F3F'}
            fontWeight={participant ? 'bold' : 'normal'}
            transform={`rotate(${visualSegmentAngle / 2}, 95, 0)`}
          >
            {num}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer / Arrow at top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: `24px solid ${colors.goldAccent}`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />

        {/* SVG Wheel */}
        <svg
          ref={scope}
          width="300"
          height="300"
          viewBox="-150 -150 300 300"
          className="drop-shadow-lg"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Outer ring */}
          <circle cx="0" cy="0" r="148" fill="none" stroke={colors.goldAccent} strokeWidth="4" />
          <circle cx="0" cy="0" r="144" fill="none" stroke={colors.primaryAccent} strokeWidth="1" />

          {/* Segments */}
          {segments}

          {/* Center circle */}
          <circle cx="0" cy="0" r="25" fill={colors.cardBg} stroke={colors.goldAccent} strokeWidth="3" />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="bold"
            fill={colors.primaryText}
          >
            🎰
          </text>
        </svg>
      </div>

      {/* Spin button */}
      {!hasWinner ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpin}
          disabled={isSpinning || participants.length === 0}
          className="px-8 py-3 rounded-full font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isSpinning
              ? colors.mutedText
              : `linear-gradient(to right, ${colors.primaryAccent}, ${colors.goldAccent})`,
            color: colors.primaryBg,
          }}
        >
          {isSpinning ? '🎰 Girando...' : participants.length === 0 ? 'No hay participantes' : '🎰 ¡GIRAR RULETA!'}
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="px-6 py-3 rounded-xl text-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${colors.goldAccent}, ${colors.primaryAccent})`,
              color: 'white',
            }}
          >
            <div className="text-sm font-medium opacity-90">🎉 ¡GANADOR!</div>
            <div className="text-2xl font-bold">
              #{winnerNumber} - {participants.find((p) => p.number === winnerNumber)?.name || 'N/A'}
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-6 py-2 rounded-full text-sm font-medium border-2"
            style={{ borderColor: colors.primaryAccent, color: colors.primaryAccent }}
          >
            🔄 Nueva Rifa
          </motion.button>
        </div>
      )}

      {/* Spinning result notification */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="p-4 rounded-xl text-center shadow-xl max-w-xs"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, ${colors.secondaryBg})`,
            border: `2px solid ${colors.goldAccent}`,
          }}
        >
          <div className="text-3xl mb-2">🎊🎉🎊</div>
          <div className="text-lg font-bold" style={{ color: colors.primaryText }}>
            ¡Felicidades!
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.goldAccent }}>
            #{result.number}
          </div>
          <div className="text-lg" style={{ color: colors.primaryText }}>
            {result.name}
          </div>
          <div className="text-sm mt-1" style={{ color: colors.mutedText }}>
            ¡Ganó la rifa!
          </div>
        </motion.div>
      )}
    </div>
  )
}
