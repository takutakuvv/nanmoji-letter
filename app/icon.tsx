import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#92400e',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {/* 封筒（上寄り・小さめ） */}
          <rect x="1" y="2" width="15" height="11" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/>
          <path d="M1 4.5l7.5 5 7.5-5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          {/* 鉛筆（右下） */}
          <g transform="translate(11, 11) rotate(-45)">
            <rect x="0" y="0" width="3.5" height="8" rx="0.5" fill="white"/>
            <polygon points="0,8 3.5,8 1.75,11" fill="#fbbf24"/>
            <rect x="0" y="0" width="3.5" height="2" rx="0.5" fill="#d97706"/>
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
