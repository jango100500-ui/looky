import React, { useEffect, useRef } from 'react'
import { GlassLensRect } from './liquidGlass'

interface TabBarProps {
  onSyncLenses: (lenses: GlassLensRect[]) => void
}

const barContainerStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: '8px',
  paddingBottom: 'max(22px, env(safe-area-inset-bottom, 22px))',
  paddingLeft: '16px',
  paddingRight: '16px',
  gap: '14px',
  pointerEvents: 'none',
  zIndex: 10,
}

const roundBtnStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
}

const centerPillStyle: React.CSSProperties = {
  height: '56px',
  paddingLeft: '22px',
  paddingRight: '26px',
  borderRadius: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  pointerEvents: 'auto',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
}

const centerTextStyle: React.CSSProperties = {
  color: '#f3f4f6',
  fontSize: '15px',
  fontWeight: 500,
  letterSpacing: '-0.01em',
}

const iconStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  objectFit: 'contain',
  filter: 'brightness(0) invert(1)',
  opacity: 0.9,
}

const mockAvatarStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.2))',
  animation: 'mockPulse 2.4s ease-in-out infinite',
}

export const TabBar: React.FC<TabBarProps> = ({ onSyncLenses }) => {
  const leftRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateBounds = () => {
      const lenses: GlassLensRect[] = []
      const refs = [leftRef.current, centerRef.current, rightRef.current]

      refs.forEach((el) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        lenses.push({
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          width: r.width,
          height: r.height,
          radius: r.height / 2,
        })
      })

      onSyncLenses(lenses)
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [onSyncLenses])

  return (
    <div style={barContainerStyle}>
      <div ref={leftRef} style={roundBtnStyle}>
        <div style={mockAvatarStyle} />
      </div>

      <div ref={centerRef} style={centerPillStyle}>
        <img
          src="/mocs/add.png"
          alt="+"
          style={iconStyle}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span style={centerTextStyle}>Новый взгляд</span>
      </div>

      <div ref={rightRef} style={roundBtnStyle}>
        <img
          src="/mocs/history.png"
          alt="История"
          style={iconStyle}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    </div>
  )
}
