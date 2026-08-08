import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])

  const refresh = useCallback(async () => {
    if (!user) { setFavorites([]); return }
    const { data } = await supabase
      .from('favorites')
      .select('book_id')
      .order('created_at', { ascending: false })
      .limit(50)
    setFavorites((data ?? []).map(r => r.book_id))
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const isFavorite = (bookId) => favorites.includes(bookId)

  const toggleFavorite = async (bookId) => {
    if (!user) return
    if (isFavorite(bookId)) {
      setFavorites(favorites.filter(id => id !== bookId))
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', bookId)
    } else {
      setFavorites([bookId, ...favorites])
      await supabase.from('favorites').insert({ user_id: user.id, book_id: bookId })
    }
  }

  return { favorites, isFavorite, toggleFavorite }
}
