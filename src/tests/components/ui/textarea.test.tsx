/**
 * Textarea コンポーネント テスト
 *
 * テスト対象: src/components/ui/textarea.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § UIコンポーネント
 * 目標カバレッジ: 75%以上
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Textarea from '@/components/ui/textarea';

describe('Textarea Component', () => {
  /**
   * TC-UI-TEXTAREA-001: 基本的なレンダリング
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-001: 基本的なレンダリング', () => {
    it('テキストエリアが表示される', () => {
      render(<Textarea placeholder="メッセージを入力" />);
      expect(screen.getByPlaceholderText('メッセージを入力')).toBeInTheDocument();
    });

    it('textareaロールを持つ', () => {
      render(<Textarea aria-label="テキストエリア" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  /**
   * TC-UI-TEXTAREA-002: 値の入力
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-002: 値の入力', () => {
    it('ユーザー入力を受け付ける', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, 'テスト入力');
      expect((textarea as HTMLTextAreaElement).value).toBe('テスト入力');
    });

    it('複数行の入力を受け付ける', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, '1行目{Enter}2行目{Enter}3行目');
      expect((textarea as HTMLTextAreaElement).value).toContain('1行目\n2行目\n3行目');
    });

    it('onChange イベントが発火する', () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      fireEvent.change(textarea, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * TC-UI-TEXTAREA-003: value プロパティ（制御コンポーネント）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-003: value プロパティ', () => {
    it('value プロパティで初期値を設定できる', () => {
      render(<Textarea value="初期テキスト" onChange={() => {}} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect((textarea as HTMLTextAreaElement).value).toBe('初期テキスト');
    });

    it('value が変更されると表示が更新される', () => {
      const { rerender } = render(
        <Textarea value="初期値" onChange={() => {}} data-testid="textarea" />
      );
      let textarea = screen.getByTestId('textarea');
      expect((textarea as HTMLTextAreaElement).value).toBe('初期値');

      rerender(<Textarea value="更新後" onChange={() => {}} data-testid="textarea" />);
      textarea = screen.getByTestId('textarea');
      expect((textarea as HTMLTextAreaElement).value).toBe('更新後');
    });
  });

  /**
   * TC-UI-TEXTAREA-004: disabled 状態
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-004: disabled 状態', () => {
    it('disabled属性を持つ', () => {
      render(<Textarea disabled data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeDisabled();
    });

    it('disabledの場合、入力を受け付けない', async () => {
      const user = userEvent.setup();
      render(<Textarea disabled data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, 'test');
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });
  });

  /**
   * TC-UI-TEXTAREA-005: rows 属性
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-005: rows 属性', () => {
    it('rows属性を設定できる', () => {
      render(<Textarea rows={5} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('異なるrows値を設定できる', () => {
      render(<Textarea rows={10} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('rows', '10');
    });
  });

  /**
   * TC-UI-TEXTAREA-006: カスタムクラス名
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-006: カスタムクラス名', () => {
    it('カスタムクラス名を追加できる', () => {
      render(<Textarea className="custom-textarea" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea.className).toContain('custom-textarea');
    });

    it('カスタムクラス名がデフォルトクラスと共存する', () => {
      render(<Textarea className="my-custom" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea.className).toContain('my-custom');
      expect(textarea.className).toContain('w-full');
      expect(textarea.className).toContain('resize-vertical');
    });
  });

  /**
   * TC-UI-TEXTAREA-007: ref転送
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-007: ref転送', () => {
    it('refを転送できる', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('refを使ってフォーカスできる', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  /**
   * TC-UI-TEXTAREA-008: HTML属性の継承
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-TEXTAREA-008: HTML属性の継承', () => {
    it('name属性を設定できる', () => {
      render(<Textarea name="description" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('name', 'description');
    });

    it('required属性を設定できる', () => {
      render(<Textarea required data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeRequired();
    });

    it('maxLength属性を設定できる', () => {
      render(<Textarea maxLength={500} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });
});
