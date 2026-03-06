import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#4f46e5',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          fontSize: '20px',
          fontWeight: '900',
          color: 'white',
          fontFamily: 'sans-serif',
          letterSpacing: '-1px',
        }}
      >
        F
      </div>
    ),
    { ...size }
  )
}
