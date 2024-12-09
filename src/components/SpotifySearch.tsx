'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SpeakerLoudIcon } from '@radix-ui/react-icons'
import { CardType } from '@/lib/card-config'

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

interface Song {
  id: string
  name: string
  artist: string
  previewUrl: string | null
  imageUrl: string | null
}

interface SpotifySearchProps {
  cardType: CardType
  onSelect: (song: Song) => void
}


// 默认歌曲映射表
const defaultSongs: Record<CardType, Song> = {
  birthday: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "Happy Birthday Song",
    artist: "Traditional",
    previewUrl: null,
    imageUrl: null,
  },
  love: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "I Will Always Love You",
    artist: "Whitney Houston",
    previewUrl: null,
    imageUrl: null,
  },
  congratulations: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "We Are the Champions",
    artist: "Queen",
    previewUrl: null,
    imageUrl: null,
  },
  thankyou: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "Thank You",
    artist: "Dido",
    previewUrl: null,
    imageUrl: null,
  },
  holiday: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "Sunflower",
    artist: "Post Malone, Swae Lee",
    previewUrl: null,
    imageUrl: null,
  },
  anniversary: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "Thinking Out Loud",
    artist: "Ed Sheeran",
    previewUrl: null,
    imageUrl: null,
  },
  sorry: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "Sorry",
    artist: "Justin Bieber",
    previewUrl: null,
    imageUrl: null,
  },
  christmas: {
    id: "2pW5kNCx133MWWirxegvng",
    name: "All I Want for Christmas Is You",
    artist: "Mariah Carey",
    previewUrl: null,
    imageUrl: null,
  },
}

export default function SpotifySearch({ cardType, onSelect }: SpotifySearchProps) {
  const [inputValue, setInputValue] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const defaultSong = defaultSongs[cardType]
    if (defaultSong) {
      setSelectedSong(defaultSong)
      setInputValue(`${defaultSong.name} - ${defaultSong.artist}`)
    }
  }, [cardType])

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setSongs([])
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setSongs(Array.isArray(data) ? data : [])
        } else {
          setSongs([])
        }
      } catch (error) {
        console.error('Search failed:', error)
        setSongs([])
      } finally {
        setLoading(false)
      }
    }, 500), 
    []
  )

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setSongs([])
      setIsSearchMode(false)
      setInputValue(selectedSong ? `${selectedSong.name} - ${selectedSong.artist}` : "")
    }
  }, [selectedSong])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  const handleInputFocus = () => {
    setIsSearchMode(true)
    setInputValue("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (isSearchMode) {
      debouncedSearch(e.target.value)
    }
  }

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song)
    setInputValue(`${song.name} - ${song.artist}`)
    setIsSearchMode(false)
    setSongs([])
    onSelect(song)
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={searchRef} className="relative">
        <div className="relative">
          <SpeakerLoudIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search music..."
            value={inputValue}
            onFocus={handleInputFocus}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isSearchMode && (loading || songs.length > 0) && (
          <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10">
            {loading ? (
              <div className="p-2 text-gray-500">Searching...</div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSongSelect(song)}
                  >
                    {song.imageUrl && (
                      <img 
                        src={song.imageUrl} 
                        alt={song.name}
                        className="w-8 h-8 rounded mr-2"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{song.name}</span>
                      <span className="text-sm text-gray-500">{song.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedSong && (
        <div>
          <iframe
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/track/${selectedSong.id}?utm_source=generator`}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  )
}