'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/button'
import { supabase } from '@/lib/supabase-auth'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/plans" 
              className="text-xl font-semibold text-gray-900"
            >
              Couple Plan
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/plans" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm"
              >
                プラン一覧
              </Link>
              <Link 
                href="/plans/new" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm"
              >
                新規プラン
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}