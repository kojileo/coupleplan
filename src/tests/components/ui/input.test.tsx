/**
 * Input コンポーネント テスト
 *
 * テスト対象: src/components/ui/input.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § UIコンポーネント
 * 目標カバレッジ: 75%以上
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Input from '@/components/ui/input';

describe('Input Component', () => {
  /**
   * TC-UI-INPUT-001: 基本的なレンダリング
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-001: 基本的なレンダリング', () => {
    it('入力フィールドが表示される', () => {
      render(<Input placeholder="名前を入力" />);
      expect(screen.getByPlaceholderText('名前を入力')).toBeInTheDocument();
    });

    it('inputロールを持つ', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('type属性を指定できる', () => {
      render(<Input type="email" data-testid="email-input" />);
      const input = screen.getByTestId('email-input');
      expect(input).toHaveAttribute('type', 'email');
    });
  });

  /**
   * TC-UI-INPUT-002: 値の入力
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-002: 値の入力', () => {
    it('ユーザー入力を受け付ける', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'テスト入力');
      expect(input.value).toBe('テスト入力');
    });

    it('onChange イベントが発火する', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('複数文字の入力でonChangeが複数回呼ばれる', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'abc');
      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * TC-UI-INPUT-003: value プロパティ（制御コンポーネント）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-003: value プロパティ', () => {
    it('value プロパティで初期値を設定できる', () => {
      render(<Input value="初期値" onChange={() => {}} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.value).toBe('初期値');
    });

    it('value が変更されると表示が更新される', () => {
      const { rerender } = render(<Input value="初期値" onChange={() => {}} data-testid="input" />);
      let input = screen.getByTestId('input');
      expect(input.value).toBe('初期値');

      rerender(<Input value="新しい値" onChange={() => {}} data-testid="input" />);
      input = screen.getByTestId('input');
      expect(input.value).toBe('新しい値');
    });
  });

  /**
   * TC-UI-INPUT-004: placeholder
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-004: placeholder', () => {
    it('placeholderテキストを表示する', () => {
      render(<Input placeholder="メールアドレス" />);
      expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument();
    });

    it('値が入力されるとplaceholderが非表示になる', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="入力してください" data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'test');
      expect(input.placeholder).toBe('入力してください');
      expect(input.value).toBe('test');
    });
  });

  /**
   * TC-UI-INPUT-005: disabled 状態
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-005: disabled 状態', () => {
    it('disabled属性を持つ', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
    });

    it('disabledの場合、入力を受け付けない', async () => {
      const user = userEvent.setup();
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'test');
      expect(input.value).toBe('');
    });
  });

  /**
   * TC-UI-INPUT-006: カスタムクラス名
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-006: カスタムクラス名', () => {
    it('カスタムクラス名を追加できる', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('custom-input');
    });

    it('カスタムクラス名がデフォルトクラスと共存する', () => {
      render(<Input className="my-custom" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('my-custom');
      expect(input.className).toContain('w-full');
      expect(input.className).toContain('border');
    });
  });

  /**
   * TC-UI-INPUT-007: ref転送
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-007: ref転送', () => {
    it('refを転送できる', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('refを使ってフォーカスできる', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('refを使って値を取得できる', async () => {
      const ref = React.createRef<HTMLInputElement>();
      const user = userEvent.setup();
      render(<Input ref={ref} />);

      await user.type(ref.current!, 'test value');
      expect(ref.current?.value).toBe('test value');
    });
  });

  /**
   * TC-UI-INPUT-008: HTML属性の継承
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-INPUT-008: HTML属性の継承', () => {
    it('name属性を設定できる', () => {
      render(<Input name="email" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('required属性を設定できる', () => {
      render(<Input required data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('maxLength属性を設定できる', () => {
      render(<Input maxLength={10} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('pattern属性を設定できる', () => {
      render(<Input pattern="[0-9]*" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('autoComplete属性を設定できる', () => {
      render(<Input autoComplete="email" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });
  });
});
