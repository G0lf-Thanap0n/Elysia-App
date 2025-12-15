import { model, Schema } from "mongoose";

interface Smart {
  smart_specific: string;
  smart_measurable: string;
  smart_achiveable: string;
  smart_relevant: string;
  smart_timeBound: string;
}

interface Goal {
  goal_title: string;
  goal_description?: string;
  goal_smart: Smart;
  goal_status: "not started" | "in progress" | "completed";
  goal_tags?: string[];
  goal_isPublic?: boolean;
}

const smartSchema = new Schema<Smart>({
  smart_specific: { type: String, required: true },
  smart_measurable: { type: String, required: true },
  smart_achiveable: { type: String, required: true },
  smart_relevant: { type: String, required: true },
  smart_timeBound: { type: String, required: true },
});

const goalSchema = new Schema<Goal>(
  {
    goal_title: { type: String, required: true, trim: true },
    goal_description: { type: String, default: "" },
    goal_smart: { type: smartSchema, required: true },
    goal_status: {
      type: String,
      enum: ["not started", "in progress", "completed"],
      default: "not started",
    },
    goal_tags: { type: [String], default: [] },
    goal_isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Goal = model<Goal>("Goal", goalSchema, "goals");
