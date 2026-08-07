import mongoose, { Schema, Model } from 'mongoose'

export interface IQuizSession {
  _id?: string
  topicId: string
  question: string
  answer: string
  qualityScore: number
  correctnessScore: number
  tradeoffScore: number
  scalabilityScore: number
  correctness: string
  tradeoff_reasoning: string
  scalability_awareness: string
  missed_points: string[]
  feedback: string
  createdAt: Date
}

const QuizSessionSchema = new Schema<IQuizSession>(
  {
    topicId: {
      type: String,
      required: true,
      ref: 'Topic'
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    qualityScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer score'
      }
    },
    correctnessScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer score'
      }
    },
    tradeoffScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer score'
      }
    },
    scalabilityScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer score'
      }
    },
    correctness: { type: String, required: true },
    tradeoff_reasoning: { type: String, required: true },
    scalability_awareness: { type: String, required: true },
    missed_points: { type: [String], required: true, default: [] },
    feedback: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  {
    timestamps: false
  }
)

QuizSessionSchema.index({ topicId: 1, createdAt: -1 })

export const QuizSession: Model<IQuizSession> =
  mongoose.models.QuizSession || mongoose.model<IQuizSession>('QuizSession', QuizSessionSchema)
