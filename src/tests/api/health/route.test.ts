/**
 * API Tests: /api/health
 *
 * ヘルスチェックAPIのテスト
 */

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常なヘルスチェックレスポンスを返す', async () => {
    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.environment).toBeDefined();
  });

  it('uptimeが含まれている', async () => {
    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(data.uptime).toBeDefined();
    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('メモリ使用量が含まれている', async () => {
    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(data.memory).toBeDefined();
    expect(data.memory.used).toBeDefined();
    expect(data.memory.total).toBeDefined();
    expect(data.memory.unit).toBe('MB');
    expect(data.memory.used).toBeGreaterThan(0);
    expect(data.memory.total).toBeGreaterThan(0);
  });

  it('環境変数が正しく反映される', async () => {
    // Arrange
    const originalEnv = process.env.NODE_ENV;
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(data.environment).toBe('test');

    // Cleanup
    (process.env as { NODE_ENV?: string }).NODE_ENV = originalEnv;
  });

  it('バージョン情報が含まれている', async () => {
    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(data.version).toBeDefined();
    expect(typeof data.version).toBe('string');
  });

  it('タイムスタンプがISO形式である', async () => {
    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  it('ステータスコード200を返す', async () => {
    // Act
    const response = await GET();

    // Assert
    expect(response.status).toBe(200);
  });

  it('Content-Typeがapplication/jsonである', async () => {
    // Act
    const response = await GET();

    // Assert
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/json');
  });
});
