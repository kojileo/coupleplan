import { PrismaClient } from '@prisma/client'

// PrismaClientのモック
const mockPrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}))

jest.mock('@prisma/client', () => ({
  PrismaClient: mockPrismaClient,
}))

describe('db', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // グローバルのPrismaインスタンスをクリア
    const globalAny = global as any
    delete globalAny.prisma
  })

  it('Prismaクライアントをシングルトンとして管理', () => {
    // 最初のインポート
    const { prisma: prisma1 } = require('@/lib/db')
    expect(mockPrismaClient).toHaveBeenCalledTimes(1)
    expect(mockPrismaClient).toHaveBeenCalledWith({
      log: ['query', 'error', 'warn'],
    })

    // 2回目のインポート
    const { prisma: prisma2 } = require('@/lib/db')
    expect(mockPrismaClient).toHaveBeenCalledTimes(1)
    expect(prisma1).toBe(prisma2)
  })
})
