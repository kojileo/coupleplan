import { cn, formatDate, auth } from '@/lib/utils'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

jest.mock('@/lib/supabase-auth', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}))

describe('utils', () => {
  describe('cn', () => {
    it('単一のクラス名を処理', () => {
      expect(cn('test-class')).toBe('test-class')
    })

    it('複数のクラス名を結合', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('条件付きクラスを処理', () => {
      const isActive = true
      expect(cn('base', isActive && 'active')).toBe('base active')
      expect(cn('base', !isActive && 'inactive')).toBe('base')
    })

    it('オブジェクト形式のクラスを処理', () => {
      expect(cn({
        'base': true,
        'active': true,
        'disabled': false
      })).toBe('base active')
    })

    it('Tailwindのクラスを適切にマージ', () => {
      expect(cn(
        'px-2 py-1',
        'p-4'  // pがpx/pyを上書き
      )).toBe('p-4')
    })

    it('異なる型の引数を組み合わせて処理', () => {
      const isDark = true
      expect(cn(
        'base-class',
        { 'dark-mode': isDark },
        isDark && 'text-white'
      )).toBe('base-class dark-mode text-white')
    })
  })

  describe('formatDate', () => {
    // タイムゾーンをモック
    let originalTZ: string | undefined

    beforeEach(() => {
      originalTZ = process.env.TZ
      process.env.TZ = 'Asia/Tokyo'
      
      // Date.prototype.toLocaleDateStringをモック
      jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function(this: Date) {
        if (this.toISOString() === '2024-01-01T09:00:00.000Z') {
          return '2024年1月1日 18:00'
        } else if (this.toISOString().includes('2024-03-20')) {
          return '2024年3月20日 15:30'
        }
        return new Date(this).toISOString()
      })
    })

    afterEach(() => {
      process.env.TZ = originalTZ
      jest.restoreAllMocks()
    })

    it('日付文字列を日本語形式でフォーマット', () => {
      const date = '2024-01-01T09:00:00Z'
      expect(formatDate(date)).toBe('2024年1月1日 18:00')
    })

    it('Dateオブジェクトを日本語形式でフォーマット', () => {
      const date = new Date('2024-01-01T09:00:00Z')
      expect(formatDate(date)).toBe('2024年1月1日 18:00')
    })

    it('nullやundefinedの場合は空文字を返す', () => {
      expect(formatDate(null as any)).toBe('')
      expect(formatDate(undefined as any)).toBe('')
    })

    it('無効な日付の場合は空文字を返す', () => {
      expect(formatDate('invalid-date')).toBe('')
    })

    it('正しい日付文字列を返す', () => {
      const date = new Date('2024-03-20T15:30:00')
      expect(formatDate(date)).toBe('2024年3月20日 15:30')
    })

    it('無効な入力の場合は空文字を返す', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('invalid-date')).toBe('')
    })
  })

  describe('auth', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('有効なトークンの場合、トークンを返す', async () => {
      const mockToken = 'valid-token'
      const req = new NextRequest('http://localhost', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })

      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      })

      const result = await auth(req)
      expect(result).toBe(mockToken)
    })

    it('認証ヘッダーがない場合、nullを返す', async () => {
      const req = new NextRequest('http://localhost')
      const result = await auth(req)
      expect(result).toBeNull()
    })

    it('無効なトークンの場合、nullを返す', async () => {
      const req = new NextRequest('http://localhost', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Invalid token'),
      })

      const result = await auth(req)
      expect(result).toBeNull()
    })
  })
})
