/**
 * Button コンポーネント テスト
 *
 * テスト対象: src/components/ui/button.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § UIコンポーネント
 * 目標カバレッジ: 75%以上
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Button from '@/components/ui/button';

describe('Button Component', () => {
  /**
   * TC-UI-BTN-001: 基本的なレンダリング
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-001: 基本的なレンダリング', () => {
    it('テキストを表示する', () => {
      render(<Button>クリック</Button>);
      expect(screen.getByText('クリック')).toBeInTheDocument();
    });

    it('デフォルトでtype="button"を持つ', () => {
      render(<Button>ボタン</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('type属性を指定できる', () => {
      render(<Button type="submit">送信</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  /**
   * TC-UI-BTN-002: バリアント（variant）
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-002: バリアント', () => {
    it('primary variant を適用できる', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-rose-600');
    });

    it('secondary variant を適用できる', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-pink-100');
    });

    it('outline variant を適用できる', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('border-2');
    });

    it('デフォルトでprimary variantになる', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-rose-600');
    });
  });

  /**
   * TC-UI-BTN-003: サイズ（size）
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-003: サイズ', () => {
    it('small サイズを適用できる', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('text-sm');
    });

    it('medium サイズを適用できる', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
    });

    it('large サイズを適用できる', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('text-lg');
    });

    it('デフォルトでmedium サイズになる', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
    });
  });

  /**
   * TC-UI-BTN-004: 無効化（disabled）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-004: 無効化', () => {
    it('disabled属性を持つ', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disabledの場合、opacity-50が適用される', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('disabledの場合、クリックイベントが発火しない', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  /**
   * TC-UI-BTN-005: クリックイベント
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-005: クリックイベント', () => {
    it('クリック時にonClickハンドラーが呼ばれる', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('複数回クリックでonClickハンドラーが複数回呼ばれる', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * TC-UI-BTN-006: カスタムクラス名
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-006: カスタムクラス名', () => {
    it('カスタムクラス名を追加できる', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('カスタムクラス名がデフォルトクラスと共存する', () => {
      render(<Button className="my-custom">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('my-custom');
      expect(button.className).toContain('rounded-lg');
    });
  });

  /**
   * TC-UI-BTN-007: ref転送
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-007: ref転送', () => {
    it('refを転送できる', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('refを使ってフォーカスできる', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  /**
   * TC-UI-BTN-008: HTML属性の継承
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-BTN-008: HTML属性の継承', () => {
    it('aria-label属性を設定できる', () => {
      render(<Button aria-label="送信ボタン">送信</Button>);
      const button = screen.getByLabelText('送信ボタン');
      expect(button).toBeInTheDocument();
    });

    it('data属性を設定できる', () => {
      render(<Button data-testid="test-button">Test</Button>);
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
    });

    it('title属性を設定できる', () => {
      render(<Button title="ツールチップ">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'ツールチップ');
    });
  });
});
