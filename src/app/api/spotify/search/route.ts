import { NextResponse } from 'next/server'

// Spotify API 凭据 (从环境变量中读取)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// 存储令牌和过期时间
let accessToken: string | null = null
let tokenExpiry: number | null = null

/**
 * 获取 Spotify API 的访问令牌
 */
async function getAccessToken() {
  // 如果令牌未过期，直接返回
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    // 请求新的访问令牌
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      console.error('Failed to fetch Spotify access token:', response.statusText)
      throw new Error('Failed to fetch Spotify access token')
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000) // 更新过期时间
    return accessToken
  } catch (error) {
    console.error('Error fetching Spotify access token:', error)
    throw new Error('Failed to fetch Spotify access token')
  }
}

/**
 * 处理搜索请求
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    // 校验查询参数
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // 获取访问令牌
    const token = await getAccessToken()
    // console.log('Access Token:', token)
    // console.log('Search Query:', query)

    // 调用 Spotify 搜索 API
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    // console.log('Search Response:', response)

    if (!response.ok) {
      console.error('Spotify API error:', response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch from Spotify API', details: response.statusText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // console.log('Search Response Data:', data)

    // 检查返回数据是否有效
    if (!data.tracks || !data.tracks.items) {
      return NextResponse.json([])
    }

    // 转换数据格式
    const songs = data.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist', // 防止 artist 数据为空
      previewUrl: track.preview_url,
      imageUrl: track.album.images[2]?.url || null, // 使用最小的图片
    }))

    // console.log('Songs:', songs)

    // 返回歌曲数据
    return NextResponse.json(songs)
  } catch (error) {
    // 捕获所有错误并返回 500 状态
    console.error('Error handling Spotify search request:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error},
      { status: 500 }
    )
  }
}