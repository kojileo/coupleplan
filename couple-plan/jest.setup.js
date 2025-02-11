import '@testing-library/jest-dom'

// 既存の console.error をラップして、特定のエラーメッセージをフィルタリングする
const originalConsoleError = console.error;

console.error = (...args) => {
  // 「cannot be a child of」と「ログインエラー:」を含む場合は出力しない
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    (args[0].includes('cannot be a child of') || args[0].includes('ログインエラー:'))
  ) {
    return;
  }
  originalConsoleError(...args);
};