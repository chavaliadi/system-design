import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('MongoDB Connection Singleton (mongodb.ts)', () => {
  const originalEnv = process.env.MONGODB_URI

  beforeEach(() => {
    vi.resetModules()
    delete global.mongooseCache
  })

  afterEach(async () => {
    process.env.MONGODB_URI = originalEnv
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })

  it('confirms connectDB() throws a clear error when MONGODB_URI is undefined', async () => {
    delete process.env.MONGODB_URI
    const { connectDB } = await import('../lib/mongodb')

    await expect(connectDB()).rejects.toThrow(
      'Please define the MONGODB_URI environment variable inside .env.local'
    )
  })

  it('confirms repeated calls to connectDB() reuse the cached connection', async () => {
    const mongoServer = await MongoMemoryServer.create()
    process.env.MONGODB_URI = mongoServer.getUri()

    const { connectDB } = await import('../lib/mongodb')

    const conn1 = await connectDB()
    const conn2 = await connectDB()

    expect(conn1).toBe(conn2)
    expect(mongoose.connection.readyState).toBe(1)

    await mongoose.disconnect()
    await mongoServer.stop()
  })
})
