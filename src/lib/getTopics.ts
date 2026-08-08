import fs from 'fs'
import path from 'path'
import { ITopic } from '@/models/Topic'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export async function getTopics(): Promise<ITopic[]> {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      console.warn(`[getTopics] Content directory does not exist: ${CONTENT_DIR}`)
      return []
    }

    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'))
    const topics: ITopic[] = []

    for (const file of files) {
      const filePath = path.join(CONTENT_DIR, file)
      try {
        const rawData = fs.readFileSync(filePath, 'utf8')
        const data = JSON.parse(rawData)

        if (!data.id || !data.name || !data.difficulty || !data.mermaid_diagram) {
          console.warn(`[getTopics] Skipping malformed topic file: ${file}`)
          continue
        }

        topics.push({
          _id: data.id,
          name: data.name,
          difficulty: data.difficulty,
          mermaid_diagram: data.mermaid_diagram,
          tradeoffs: Array.isArray(data.tradeoffs) ? data.tradeoffs : [],
          interview_questions: Array.isArray(data.interview_questions) ? data.interview_questions : []
        })
      } catch (err) {
        console.error(`[getTopics] Error reading/parsing topic file ${file}:`, err)
      }
    }

    return topics
  } catch (err) {
    console.error('[getTopics] Failed to load topics:', err)
    return []
  }
}

export async function getTopicById(id: string): Promise<ITopic | null> {
  if (!id) return null
  const topics = await getTopics()
  return topics.find((t) => t._id === id) || null
}
