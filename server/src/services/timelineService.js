const Timeline = require("../models/Timeline");

const createTimelineEvent = async ({
  caseId,
  status,
  action,
  performedBy,
  description,
}) => {
  const timelineEvent = await Timeline.create({
    caseId,
    status,
    action,
    performedBy,
    description,
  });

  return timelineEvent;
};

const getCaseTimeline = async (caseId) => {
  const timeline = await Timeline.find({ caseId })
    .populate("performedBy", "name email role")
    .sort({ createdAt: 1 });

  return timeline;
};

module.exports = {
  createTimelineEvent,
  getCaseTimeline,
};