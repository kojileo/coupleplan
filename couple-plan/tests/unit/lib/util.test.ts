import { cn } from '@/lib/utils'

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
})
