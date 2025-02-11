import '@testing-library/jest-dom'

// 既存の console.error を上書きして、特定の警告メッセージをフィルタリングする
const originalConsoleError = console.error;

console.error = (...args) => {
  // 警告メッセージに「cannot be a child of」が含まれている場合は何もしない
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    args[0].includes('cannot be a child of')
  ) {
    return;
  }
  // その他のメッセージはそのまま出力
  originalConsoleError(...args);
};