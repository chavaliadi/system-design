import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Topic } from '../models/Topic'
import fs from 'fs'
import path from 'path'

describe('Topic Model (AC-1)', () => {
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
    await Topic.deleteMany({})
  })

  it('rejects a document with difficulty outside ["easy", "medium", "hard"]', async () => {
    const invalidTopic = new Topic({
      _id: 'invalid-difficulty-topic',
      name: 'Invalid Difficulty',
      difficulty: 'extreme',
      mermaid_diagram: 'graph TD; A-->B;',
      tradeoffs: [{ option_a: 'A', option_b: 'B', chosen: 'A', reason: 'speed' }],
      interview_questions: ['Q1']
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await invalidTopic.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.difficulty).toBeDefined()
  })

  it('rejects a document missing required fields', async () => {
    const incompleteTopic = new Topic({
      _id: 'incomplete-topic'
    })

    let err: mongoose.Error.ValidationError | null = null
    try {
      await incompleteTopic.save()
    } catch (error) {
      err = error as mongoose.Error.ValidationError
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err?.errors.name).toBeDefined()
    expect(err?.errors.difficulty).toBeDefined()
    expect(err?.errors.mermaid_diagram).toBeDefined()
    expect(err?.errors.tradeoffs).toBeDefined()
  })

  it('accepts a valid document matching content/url-shortener.json fixture', async () => {
    const fixturePath = path.join(process.cwd(), 'content', 'url-shortener.json')
    const rawData = fs.readFileSync(fixturePath, 'utf8')
    const fixture = JSON.parse(rawData)

    const topicDoc = new Topic({
      _id: fixture.id,
      name: fixture.name,
      difficulty: fixture.difficulty,
      mermaid_diagram: fixture.mermaid_diagram,
      tradeoffs: fixture.tradeoffs,
      interview_questions: fixture.interview_questions
    })

    const saved = await topicDoc.save()
    expect(saved._id).toBe('url-shortener')
    expect(saved.name).toBe('URL Shortener')
    expect(saved.difficulty).toBe('medium')
    expect(saved.tradeoffs.length).toBe(fixture.tradeoffs.length)
  })

  it('confirms _id is stored as string and not cast to ObjectId', async () => {
    const topic = new Topic({
      _id: 'url-shortener',
      name: 'URL Shortener',
      difficulty: 'medium',
      mermaid_diagram: 'graph TD;',
      tradeoffs: [{ option_a: 'A', option_b: 'B', chosen: 'A', reason: 'reason' }],
      interview_questions: ['Q1']
    })

    await topic.save()
    const fetched = await Topic.findById('url-shortener')
    expect(fetched).not.toBeNull()
    expect(fetched?._id).toBe('url-shortener')
    expect(typeof fetched?._id).toBe('string')
    expect(mongoose.Types.ObjectId.isValid(fetched?._id ?? '')).toBe(false)
  })
})
