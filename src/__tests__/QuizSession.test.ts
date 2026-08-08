import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { QuizSession } from '../models/QuizSession'

describe('QuizSession Model (AC-3)', () => {
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
    await QuizSession.deleteMany({})
    await QuizSession.syncIndexes()
  })

  it('rejects qualityScore, correctnessScore, tradeoffScore, or scalabilityScore outside [1, 5]', async () => {
    const invalidSession = new QuizSession({
      topicId: 'topic-1',
      question: 'Q?',
      answer: 'A',
      qualityScore: 0,
      correctnessScore: 6,
      tradeoffScore: -1,
      scalabilityScore: 10,
      correctness: 'Correct text',
      tradeoff_reasoning: 'Tradeoff text',
      scalability_awareness: 'Scalability text',
      feedback: 'Feedback text'
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await invalidSession.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.qualityScore).toBeDefined()
    expect(err?.errors.correctnessScore).toBeDefined()
    expect(err?.errors.tradeoffScore).toBeDefined()
    expect(err?.errors.scalabilityScore).toBeDefined()
  })

  it('rejects a non-integer score (e.g. 3.5) on any of the four score fields', async () => {
    const floatSession = new QuizSession({
      topicId: 'topic-1',
      question: 'Q?',
      answer: 'A',
      qualityScore: 3.5,
      correctnessScore: 4.2,
      tradeoffScore: 2.1,
      scalabilityScore: 4.9,
      correctness: 'Text',
      tradeoff_reasoning: 'Text',
      scalability_awareness: 'Text',
      feedback: 'Text'
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await floatSession.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.qualityScore).toBeDefined()
    expect(err?.errors.correctnessScore).toBeDefined()
    expect(err?.errors.tradeoffScore).toBeDefined()
    expect(err?.errors.scalabilityScore).toBeDefined()
  })

  it('rejects a document missing any required field', async () => {
    const incompleteSession = new QuizSession({
      topicId: 'topic-1'
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await incompleteSession.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.question).toBeDefined()
    expect(err?.errors.answer).toBeDefined()
    expect(err?.errors.qualityScore).toBeDefined()
    expect(err?.errors.feedback).toBeDefined()
  })

  it('confirms the compound index { topicId: 1, createdAt: -1 } exists in the collection', async () => {
    const indexes = await QuizSession.collection.indexes()
    const compoundIndex = indexes.find(
      (idx) => idx.key.topicId === 1 && idx.key.createdAt === -1
    )

    expect(compoundIndex).toBeDefined()
  })
})
