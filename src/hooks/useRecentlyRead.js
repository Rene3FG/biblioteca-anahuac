import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useRecentlyRead() {
  const { user } = useAuth()
  const [recentlyRead, setRecentlyRead] = useState([])

  const refresh = useCallback(async () => {
    if (!user) { setRecentlyRead([]); return }
    const { data } = await supabase
      .from('recently_read')
      .select('book_id')
      .order('last_read_at', { ascending: false })
      .limit(10)
    setRecentlyRead((data ?? []).map(r => r.book_id))
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const recordRead = async (bookId) => {
    if (!user) return
    await supabase
      .from('recently_read')
      .upsert({ user_id: user.id, book_id: bookId, last_read_at: new Date().toISOString() })
    refresh()
  }

  return { recentlyRead, recordRead }
}
