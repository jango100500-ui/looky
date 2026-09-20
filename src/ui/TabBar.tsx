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
  justifyContent: 'space-between',
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 8px)',
  pointerEvents: 'none',
  zIndex: 10,
}

const sideButtonStyle: React.CSSProperties = {
  width: '46px',
  height: '46px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
  flexShrink: 0,
  transition: 'transform 0.15s ease, opacity 0.15s ease',
}

const centerPillStyle: React.CSSProperties = {
  height: '46px',
  paddingLeft: '20px',
  paddingRight: '22px',
  borderRadius: '23px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  pointerEvents: 'auto',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
  transition: 'transform 0.15s ease, opacity 0.15s ease',
}

const centerTextStyle: React.CSSProperties = {
  color: '#f4f4f6',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
}

const iconStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  objectFit: 'contain',
  filter: 'brightness(0) invert(1)',
  opacity: 0.88,
}

const avatarWrapperStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const mockAvatarStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.15))',
  animation: 'mockPulse 2.6s ease-in-out infinite',
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
    const timer = setTimeout(updateBounds, 50)
    window.addEventListener('resize', updateBounds)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateBounds)
    }
  }, [onSyncLenses])

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.currentTarget.style.transform = 'scale(0.93)'
    e.currentTarget.style.opacity = '0.75'
  }

  const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.currentTarget.style.transform = 'scale(1)'
    e.currentTarget.style.opacity = '1'
  }

  return (
    <div style={barContainerStyle}>
      <div
        ref={leftRef}
        style={sideButtonStyle}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
      >
        <div style={avatarWrapperStyle}>
          <div style={mockAvatarStyle} />
        </div>
      </div>

      <div
        ref={centerRef}
        style={centerPillStyle}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
      >
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

      <div
        ref={rightRef}
        style={sideButtonStyle}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
      >
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
