import mongoose, { Schema, Model } from 'mongoose'

export interface ITradeoff {
  option_a: string
  option_b: string
  chosen: string
  reason: string
}

export interface ITopic {
  _id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  mermaid_diagram: string
  tradeoffs: ITradeoff[]
  interview_questions: string[]
}

const TradeoffSchema = new Schema<ITradeoff>(
  {
    option_a: { type: String, required: true },
    option_b: { type: String, required: true },
    chosen: { type: String, required: true },
    reason: { type: String, required: true }
  },
  { _id: false }
)

const TopicSchema = new Schema<ITopic>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard']
    },
    mermaid_diagram: { type: String, required: true },
    tradeoffs: {
      type: [TradeoffSchema],
      required: true,
      validate: {
        validator: (arr: ITradeoff[]) => Array.isArray(arr) && arr.length > 0,
        message: 'tradeoffs must be a non-empty array'
      }
    },
    interview_questions: { type: [String], required: true, default: [] }
  },
  {
    _id: false,
    timestamps: false
  }
)

export const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema)
