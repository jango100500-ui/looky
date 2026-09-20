import React, { useEffect, useRef } from 'react'
import { LiquidGlassEngine, GlassLensRect } from '../ui/liquidGlass'
import { TabBar } from '../ui/TabBar'

const appContainerStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  position: 'fixed',
  inset: 0,
  backgroundColor: '#0a0a0c',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

const glCanvasStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 5,
}

const contentLayerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 'env(safe-area-inset-top, 24px)',
}

const lookyLogoStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  color: 'rgba(255, 255, 255, 0.15)',
}

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<LiquidGlassEngine | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new LiquidGlassEngine(canvasRef.current)
    engineRef.current = engine

    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
    }
  }, [])

  const handleSyncLenses = (lenses: GlassLensRect[]) => {
    if (engineRef.current) {
      engineRef.current.updateLenses(lenses)
    }
  }

  return (
    <div style={appContainerStyle}>
      <canvas ref={canvasRef} style={glCanvasStyle} />

      <div style={contentLayerStyle}>
        <span style={lookyLogoStyle}>looky</span>
      </div>

      <TabBar onSyncLenses={handleSyncLenses} />
    </div>
  )
}
