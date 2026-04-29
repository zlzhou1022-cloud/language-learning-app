import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // 使用 implicit flow，Magic Link 不依赖 code_verifier
        // 这样在任何浏览器打开链接都能登录，不要求与发起请求的浏览器相同
        flowType: 'implicit',
      },
    }
  )
}
