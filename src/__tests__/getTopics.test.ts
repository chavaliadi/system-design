import { describe, it, expect } from 'vitest'
import { getTopics, getTopicById } from '../lib/getTopics'

describe('getTopics Data Access Module (AC-1, AC-6)', () => {
  it('loads all 8 system design topics from content/*.json', async () => {
    const topics = await getTopics()
    expect(topics.length).toBe(8)
    
    // Confirm essential fields on every topic
    for (const t of topics) {
      expect(t._id).toBeDefined()
      expect(t.name).toBeDefined()
      expect(['easy', 'medium', 'hard']).toContain(t.difficulty)
      expect(t.mermaid_diagram).toBeDefined()
      expect(Array.isArray(t.tradeoffs)).toBe(true)
      expect(Array.isArray(t.interview_questions)).toBe(true)
    }
  })

  it('getTopicById returns correct topic for valid id (e.g. url-shortener)', async () => {
    const topic = await getTopicById('url-shortener')
    expect(topic).not.toBeNull()
    expect(topic?._id).toBe('url-shortener')
    expect(topic?.name).toBe('URL Shortener')
    expect(topic?.difficulty).toBe('medium')
    expect(topic?.tradeoffs.length).toBeGreaterThan(0)
  })

  it('getTopicById returns null (not throws) for non-existent topic id', async () => {
    const topic = await getTopicById('non-existent-topic')
    expect(topic).toBeNull()
  })

  it('getTopicById returns null for empty string or null argument', async () => {
    const topic = await getTopicById('')
    expect(topic).toBeNull()
  })
})
