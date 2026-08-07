import mongoose, { Schema, Model } from 'mongoose'

export interface ISM2State {
  _id?: string
  topicId: string
  interval: number
  easeFactor: number
  repetitions: number
  nextReview: Date
  masteryScore: number
  avgCorrectness: number
  avgTradeoffReasoning: number
  avgScalabilityAwareness: number
  updatedAt: Date
}

const SM2StateSchema = new Schema<ISM2State>(
  {
    topicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      ref: 'Topic'
    },
    interval: { type: Number, required: true, default: 0, min: 0 },
    easeFactor: { type: Number, required: true, default: 2.5, min: 1.3 },
    repetitions: { type: Number, required: true, default: 0, min: 0 },
    nextReview: { type: Date, required: true, default: Date.now },
    masteryScore: { type: Number, required: true, default: 0, min: 0, max: 5 },
    avgCorrectness: { type: Number, required: true, default: 0, min: 0, max: 5 },
    avgTradeoffReasoning: { type: Number, required: true, default: 0, min: 0, max: 5 },
    avgScalabilityAwareness: { type: Number, required: true, default: 0, min: 0, max: 5 },
    updatedAt: { type: Date, required: true, default: Date.now }
  },
  {
    timestamps: false
  }
)

export const SM2State: Model<ISM2State> =
  mongoose.models.SM2State || mongoose.model<ISM2State>('SM2State', SM2StateSchema)
