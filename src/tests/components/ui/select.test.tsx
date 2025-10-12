/**
 * Select コンポーネント テスト
 *
 * テスト対象: src/components/ui/select.tsx
 * テスト計画: Docs/tests/TEST_CASES.md § UIコンポーネント
 * 目標カバレッジ: 75%以上
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from '@/components/ui/select';

describe('Select Component', () => {
  /**
   * TC-UI-SELECT-001: 基本的なレンダリング
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-001: 基本的なレンダリング', () => {
    it('セレクトボックスが表示される', () => {
      render(
        <Select data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('複数のオプションを表示できる', () => {
      render(
        <Select data-testid="select">
          <option value="1">オプション1</option>
          <option value="2">オプション2</option>
          <option value="3">オプション3</option>
        </Select>
      );
      expect(screen.getByText('オプション1')).toBeInTheDocument();
      expect(screen.getByText('オプション2')).toBeInTheDocument();
      expect(screen.getByText('オプション3')).toBeInTheDocument();
    });
  });

  /**
   * TC-UI-SELECT-002: 値の選択
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-002: 値の選択', () => {
    it('ユーザーが値を選択できる', async () => {
      const user = userEvent.setup();
      render(
        <Select data-testid="select">
          <option value="">選択してください</option>
          <option value="option1">オプション1</option>
          <option value="option2">オプション2</option>
        </Select>
      );
      const select = screen.getByTestId('select') as HTMLSelectElement;

      await user.selectOptions(select, 'option1');
      expect(select.value).toBe('option1');
    });

    it('onChange イベントが発火する', () => {
      const handleChange = jest.fn();
      render(
        <Select onChange={handleChange} data-testid="select">
          <option value="1">オプション1</option>
          <option value="2">オプション2</option>
        </Select>
      );
      const select = screen.getByTestId('select');

      fireEvent.change(select, { target: { value: '2' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * TC-UI-SELECT-003: value プロパティ（制御コンポーネント）
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-003: value プロパティ', () => {
    it('value プロパティで初期値を設定できる', () => {
      render(
        <Select value="option2" onChange={() => {}} data-testid="select">
          <option value="option1">オプション1</option>
          <option value="option2">オプション2</option>
        </Select>
      );
      const select = screen.getByTestId('select') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('value が変更されると選択が更新される', () => {
      const { rerender } = render(
        <Select value="option1" onChange={() => {}} data-testid="select">
          <option value="option1">オプション1</option>
          <option value="option2">オプション2</option>
        </Select>
      );
      let select = screen.getByTestId('select') as HTMLSelectElement;
      expect(select.value).toBe('option1');

      rerender(
        <Select value="option2" onChange={() => {}} data-testid="select">
          <option value="option1">オプション1</option>
          <option value="option2">オプション2</option>
        </Select>
      );
      select = screen.getByTestId('select') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });
  });

  /**
   * TC-UI-SELECT-004: disabled 状態
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-004: disabled 状態', () => {
    it('disabled属性を持つ', () => {
      render(
        <Select disabled data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      const select = screen.getByTestId('select');
      expect(select).toBeDisabled();
    });

    it('disabledの場合、値を変更できない', async () => {
      const user = userEvent.setup();
      render(
        <Select disabled data-testid="select" defaultValue="option1">
          <option value="option1">オプション1</option>
          <option value="option2">オプション2</option>
        </Select>
      );
      const select = screen.getByTestId('select') as HTMLSelectElement;

      await user.selectOptions(select, 'option2');
      expect(select.value).toBe('option1'); // 変更されない
    });
  });

  /**
   * TC-UI-SELECT-005: カスタムクラス名
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-005: カスタムクラス名', () => {
    it('カスタムクラス名を追加できる', () => {
      render(
        <Select className="custom-select" data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      const select = screen.getByTestId('select');
      expect(select.className).toContain('custom-select');
    });

    it('カスタムクラス名がデフォルトクラスと共存する', () => {
      render(
        <Select className="my-custom" data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      const select = screen.getByTestId('select');
      expect(select.className).toContain('my-custom');
      expect(select.className).toContain('w-full');
      expect(select.className).toContain('bg-white');
    });
  });

  /**
   * TC-UI-SELECT-006: ref転送
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-006: ref転送', () => {
    it('refを転送できる', () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(
        <Select ref={ref}>
          <option value="1">オプション1</option>
        </Select>
      );
      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });

    it('refを使ってフォーカスできる', () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(
        <Select ref={ref} data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  /**
   * TC-UI-SELECT-007: HTML属性の継承
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-007: HTML属性の継承', () => {
    it('name属性を設定できる', () => {
      render(
        <Select name="category" data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('name', 'category');
    });

    it('required属性を設定できる', () => {
      render(
        <Select required data-testid="select">
          <option value="1">オプション1</option>
        </Select>
      );
      const select = screen.getByTestId('select');
      expect(select).toBeRequired();
    });

    it('multiple属性を設定できる', () => {
      render(
        <Select multiple data-testid="select">
          <option value="1">オプション1</option>
          <option value="2">オプション2</option>
        </Select>
      );
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('multiple');
    });

    it('aria-label属性を設定できる', () => {
      render(
        <Select aria-label="カテゴリー選択">
          <option value="1">オプション1</option>
        </Select>
      );
      const select = screen.getByLabelText('カテゴリー選択');
      expect(select).toBeInTheDocument();
    });
  });

  /**
   * TC-UI-SELECT-008: defaultValue
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-UI-SELECT-008: defaultValue', () => {
    it('defaultValueで初期選択値を設定できる', () => {
      render(
        <Select defaultValue="option2" data-testid="select">
          <option value="option1">オプション1</option>
          <option value="option2">オプション2</option>
        </Select>
      );
      const select = screen.getByTestId('select') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });
  });
});
