import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { SM2State } from '../models/SM2State'

describe('SM2State Model (AC-2)', () => {
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await SM2State.deleteMany({})
    await SM2State.syncIndexes()
  })

  it('rejects easeFactor below 1.3', async () => {
    const invalidState = new SM2State({
      topicId: 'topic-1',
      easeFactor: 1.2
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await invalidState.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.easeFactor).toBeDefined()
  })

  it('rejects score fields outside [0, 5]', async () => {
    const invalidState = new SM2State({
      topicId: 'topic-1',
      masteryScore: 6,
      avgCorrectness: -1,
      avgTradeoffReasoning: 5.5,
      avgScalabilityAwareness: -0.1
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await invalidState.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.masteryScore).toBeDefined()
    expect(err?.errors.avgCorrectness).toBeDefined()
    expect(err?.errors.avgTradeoffReasoning).toBeDefined()
    expect(err?.errors.avgScalabilityAwareness).toBeDefined()
  })

  it('enforces uniqueness on topicId', async () => {
    await SM2State.create({ topicId: 'topic-unique' })

    let err: any = null
    try {
      await SM2State.create({ topicId: 'topic-unique' })
    } catch (error) {
      err = error
    }

    expect(err).toBeDefined()
    expect(err.code).toBe(11000)
  })

  it('confirms defaults apply correctly on insert', async () => {
    const state = await SM2State.create({ topicId: 'default-topic' })

    expect(state.interval).toBe(0)
    expect(state.easeFactor).toBe(2.5)
    expect(state.repetitions).toBe(0)
    expect(state.masteryScore).toBe(0)
    expect(state.avgCorrectness).toBe(0)
    expect(state.avgTradeoffReasoning).toBe(0)
    expect(state.avgScalabilityAwareness).toBe(0)
    expect(state.nextReview).toBeInstanceOf(Date)
    expect(state.updatedAt).toBeInstanceOf(Date)
  })
})
