'use client'

interface SpotifyPlayerProps {
  trackId: string
}

export default function SpotifyPlayer({ trackId }: SpotifyPlayerProps) {
  return (
    <div className="w-full">
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=1`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        style={{
          borderRadius: '12px',
          border: '0'
        }}
      />
    </div>
  )
}