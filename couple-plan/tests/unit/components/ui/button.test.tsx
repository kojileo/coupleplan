import { render, screen } from '@testing-library/react'
import Button from '@/components/ui/button'

describe('Button', () => {
  it('デフォルトのvariantとsizeでレンダリングされる', () => {
    render(<Button>テストボタン</Button>)
    const button = screen.getByRole('button', { name: 'テストボタン' })
    
    // デフォルトのvariant (primary) のスタイルを確認
    expect(button).toHaveClass('bg-rose-600')
    expect(button).toHaveClass('text-white')
    
    // デフォルトのsize (md) のスタイルを確認
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('secondary variantが適用される', () => {
    render(<Button variant="secondary">セカンダリボタン</Button>)
    const button = screen.getByRole('button', { name: 'セカンダリボタン' })
    
    expect(button).toHaveClass('bg-pink-100')
    expect(button).toHaveClass('text-rose-800')
  })

  it('outline variantが適用される', () => {
    render(<Button variant="outline">アウトラインボタン</Button>)
    const button = screen.getByRole('button', { name: 'アウトラインボタン' })
    
    expect(button).toHaveClass('border-2')
    expect(button).toHaveClass('border-rose-200')
    expect(button).toHaveClass('bg-transparent')
  })

  it('サイズバリエーションが適用される', () => {
    const { rerender } = render(<Button size="sm">小さいボタン</Button>)
    let button = screen.getByRole('button', { name: '小さいボタン' })
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-1.5')
    expect(button).toHaveClass('text-sm')

    rerender(<Button size="lg">大きいボタン</Button>)
    button = screen.getByRole('button', { name: '大きいボタン' })
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
    expect(button).toHaveClass('text-lg')
  })

  it('カスタムクラス名が適用される', () => {
    render(<Button className="custom-class">カスタムボタン</Button>)
    const button = screen.getByRole('button', { name: 'カスタムボタン' })
    
    expect(button).toHaveClass('custom-class')
  })

  it('その他のボタンpropsが適用される', () => {
    render(
      <Button disabled type="submit" data-testid="test-button">
        プロップボタン
      </Button>
    )
    const button = screen.getByTestId('test-button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')
  })
})
