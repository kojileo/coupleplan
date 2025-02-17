import { cn, formatDate } from '@/lib/utils'

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
  })
})
