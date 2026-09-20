import React from 'react'

const containerStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000000',
  color: '#ffffff',
  paddingTop: 'env(safe-area-inset-top, 20px)',
  paddingBottom: 'env(safe-area-inset-bottom, 20px)',
  paddingLeft: 'env(safe-area-inset-left, 16px)',
  paddingRight: 'env(safe-area-inset-right, 16px)',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

const titleStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 700,
  letterSpacing: '-0.03em',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: '#888888',
  marginTop: '8px',
}

export const App = () => {
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>looky</h1>
      <p style={subtitleStyle}>Ready for iOS</p>
    </div>
  )
}
