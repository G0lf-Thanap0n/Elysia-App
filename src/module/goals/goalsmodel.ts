import { t } from "elysia";

// ----------------------------- Body Model for CREATE GOAL ROUTE  -----------------------------

export const CreateGoalBody = t.Object({
  goal_title: t.String(),
  goal_description: t.Optional(t.String()),
  goal_smart: t.Object({
    smart_specific: t.String(),
    smart_measurable: t.String(),
    smart_achievable: t.String(),
    smart_relevant: t.String(),
    smart_timeBound: t.String(),
  }),
  goal_status: t.Optional(
    t.Union([
      t.Literal("not started"),
      t.Literal("in progress"),
      t.Literal("completed"),
    ]),
  ),
  goal_tags: t.Optional(t.Array(t.String())),
  goal_isPublic: t.Optional(t.Boolean()),
});

export type CreateGoalBodyType = typeof CreateGoalBody.static;

// ----------------------------- Body Model for UPDATE GOAL ROUTE  -----------------------------
export const UpdateGoalBody = t.Object({
  goal_title: t.Optional(t.String()),
  goal_description: t.Optional(t.String()),
  goal_smart: t.Optional(
    t.Object({
      smart_specific: t.Optional(t.String()),
      smart_measurable: t.Optional(t.String()),
      smart_achievable: t.Optional(t.String()),
      smart_relevant: t.Optional(t.String()),
      smart_timeBound: t.Optional(t.String()),
    }),
  ),
  goal_status: t.Optional(
    t.Union([
      t.Literal("not started"),
      t.Literal("in progress"),
      t.Literal("completed"),
    ]),
  ),
  goal_tags: t.Optional(t.Array(t.String())),
  goal_isPublic: t.Optional(t.Boolean()),
});

export type UpdateGoalBodyType = typeof UpdateGoalBody.static;
