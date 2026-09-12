const Case = require("../models/Case");
const { buildAnalytics } = require("../services/analyticsService");

const mapCaseForAnalytics = (caseRecord) => {
  const fir = caseRecord.firId;

  return {
    caseId: caseRecord.caseId,

    firId:
      fir?.firNumber ||
      fir?._id?.toString() ||
      "",

    incidentDescription:
      fir?.incidentDescription || "",

    category:
      fir?.category || "Unknown",

    incidentLocation:
      fir?.incidentLocation || "Unknown",

    incidentDate:
      fir?.incidentDate ||
      caseRecord.createdAt,

    status:
      caseRecord.status,

    priority:
      caseRecord.priority,

    createdAt:
      caseRecord.createdAt,
  };
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    let fromDate = null;
    let toDate = null;

    if (from) {
      fromDate = new Date(`${from}T00:00:00.000Z`);

      if (Number.isNaN(fromDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid 'from' date.",
        });
      }
    }

    if (to) {
      toDate = new Date(`${to}T23:59:59.999Z`);

      if (Number.isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid 'to' date.",
        });
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "'from' date cannot be after 'to' date.",
      });
    }

    const cases = await Case.find({})
      .populate(
        "firId",
        "firNumber incidentDescription incidentDate incidentLocation category"
      )
      .lean();

    const analyticsCases =
      cases.map(mapCaseForAnalytics);

    const analytics = buildAnalytics(
      analyticsCases,
      fromDate,
      toDate
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};