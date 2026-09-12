const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const cleanText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getCaseId = (item) =>
  String(item.caseId || item.id || item.firId || "").trim();

const getFirId = (item) =>
  String(item.firId || "").trim();

const getDescription = (item) =>
  String(
    item.incidentDescription ||
      item.description ||
      item.text ||
      ""
  ).trim();

const getStatus = (item) =>
  normalize(item.status || item.caseStatus || "unknown");

const getType = (item) =>
  String(
    item.category ||
      item.type ||
      item.incidentType ||
      "Unknown"
  ).trim();

const getLocation = (item) =>
  String(
    item.incidentLocation ||
      item.location ||
      item.station ||
      item.policeStation ||
      "Unknown"
  ).trim();

const getDate = (item) =>
  item.incidentDate ||
  item.filedDate ||
  item.createdAt ||
  item.date ||
  null;

const getPriority = (item) =>
  normalize(
    item.priority ||
      item.casePriority ||
      item.severity ||
      item.urgency ||
      "normal"
  );

const isPending = (item) => {
  const status = getStatus(item).replace(/[\s_-]+/g, "");

  return [
    "pending",
    "open",
    "registered",
    "underinvestigation",
    "investigationpending",
    "awaitinginvestigation",
    "awaitingaction",
    "inprogress",
    "active",
  ].includes(status);
};

const countBy = (items, getter) => {
  const map = new Map();

  for (const item of items) {
    const key = getter(item) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }

  return [...map.entries()]
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name)
    );
};


// -------------------------
// Category Classification
// -------------------------

const CATEGORY_PROFILES = {
  "Cyber Crime": [
    "cyber",
    "online",
    "internet",
    "phishing",
    "otp",
    "bank",
    "upi",
    "password",
    "hacked",
    "fraud",
    "scam",
    "transaction",
  ],

  Theft: [
    "stolen",
    "steal",
    "theft",
    "robbery",
    "burglary",
    "snatched",
    "missing phone",
    "laptop stolen",
  ],

  Assault: [
    "assault",
    "attack",
    "beaten",
    "threatened",
    "injury",
    "fight",
  ],

  "Missing Person": [
    "missing",
    "disappeared",
    "cannot find",
    "last seen",
  ],

  Accident: [
    "accident",
    "collision",
    "crash",
    "vehicle",
    "road accident",
  ],

  "Domestic Violence": [
    "domestic",
    "husband",
    "wife",
    "family violence",
    "abuse at home",
  ],

  "Property Dispute": [
    "property",
    "land",
    "boundary",
    "ownership",
    "tenant",
    "dispute",
  ],
};

const scoreCategory = (text, profile) => {
  const normalized = cleanText(text);

  return profile.reduce(
    (score, term) =>
      normalized.includes(term)
        ? score + (term.includes(" ") ? 2 : 1)
        : score,
    0
  );
};

const classifyCase = (item) => {
  const backendCategory =
    item.category ||
    item.type ||
    item.incidentType;

  if (backendCategory) {
    return {
      category: String(backendCategory),
      confidence: 0.98,
      source: "backend-category",
      explanation:
        "Classification based on the category recorded in the case data.",
    };
  }

  const text = getDescription(item);

  let bestCategory = "Other";
  let bestScore = 0;

  for (const [category, profile] of Object.entries(
    CATEGORY_PROFILES
  )) {
    const score = scoreCategory(text, profile);

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return {
    category: bestCategory,
    confidence:
      bestScore === 0
        ? 0.25
        : Math.min(0.95, 0.45 + bestScore * 0.08),
    source: "local-nlp",
    explanation:
      bestScore === 0
        ? "No strong category indicators were found."
        : "Classification based on incident description keywords.",
  };
};


// -------------------------
// Priority Analysis
// -------------------------

const analyzePriority = (item) => {
  const text = cleanText(
    `${getDescription(item)} ${getType(item)}`
  );

  const providedPriority = getPriority(item);

  if (
    ["high", "critical", "urgent", "emergency", "veryhigh"].includes(
      providedPriority.replace(/\s+/g, "")
    )
  ) {
    return {
      priority: "HIGH",
      confidence: 0.98,
      source: "backend-priority",
      score: 0,
    };
  }

  let score = 0;

  const severeTerms = [
    "murder",
    "life threat",
    "kidnapping",
    "hostage",
    "weapon",
    "rape",
  ];

  const majorTerms = [
    "major injury",
    "serious injury",
    "critical",
    "emergency",
  ];

  const financialTerms = [
    "large financial loss",
    "bank fraud",
    "financial fraud",
    "identity theft",
  ];

  const threatTerms = [
    "threat",
    "violence",
    "attack",
  ];

  if (severeTerms.some((term) => text.includes(term))) {
    score += 5;
  }

  if (majorTerms.some((term) => text.includes(term))) {
    score += 4;
  }

  if (financialTerms.some((term) => text.includes(term))) {
    score += 3;
  }

  if (threatTerms.some((term) => text.includes(term))) {
    score += 2;
  }

  if (
    text.includes("cyber") &&
    ["otp", "bank", "upi", "transaction", "phishing"].some(
      (term) => text.includes(term)
    )
  ) {
    score += 1;
  }

  let priority = "LOW";

  if (score >= 5) {
    priority = "HIGH";
  } else if (score >= 2) {
    priority = "MEDIUM";
  }

  return {
    priority,
    confidence:
      score === 0
        ? 0.62
        : Math.min(0.93, 0.65 + score * 0.05),
    source: "analytics-rules",
    score,
  };
};


// -------------------------
// Case Analysis
// -------------------------

const analyzeCase = (item) => {
  const classification = classifyCase(item);
  const priority = analyzePriority(item);

  return {
    caseId: getCaseId(item),
    firId: getFirId(item),
    classification,
    priority,
  };
};


// -------------------------
// Main Analytics
// -------------------------

const buildAnalytics = (cases, from = null, to = null) => {
  const filteredCases = cases.filter((item) => {
    const date = new Date(getDate(item));

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    if (from && date < from) {
      return false;
    }

    if (to && date > to) {
      return false;
    }

    return true;
  });

  const analyses = filteredCases.map(analyzeCase);

  const categories = countBy(
    filteredCases,
    getType
  );

  const locations = countBy(
    filteredCases,
    getLocation
  ).slice(0, 10);

  const statuses = countBy(
    filteredCases,
    getStatus
  );

  const priorities = countBy(
    filteredCases,
    (item) => {
      const result = analyzePriority(item);
      return result.priority;
    }
  );

  const pendingCases = filteredCases.filter(
    isPending
  ).length;

  const closedStatuses = [
    "resolved",
    "closed",
    "chargesheet",
    "courtregistered",
    "disposed",
    "completed",
  ];

  const closedCases = filteredCases.filter((item) =>
    closedStatuses.includes(
      getStatus(item).replace(/[\s_-]+/g, "")
    )
  ).length;

  const activeCases =
    filteredCases.length - closedCases;

  const highPriorityCases = filteredCases.filter(
    (item) =>
      analyzePriority(item).priority === "HIGH"
  ).length;

  return {
    generatedAt: new Date().toISOString(),

    filters: {
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
    },

    summary: {
      totalCases: filteredCases.length,
      highPriorityCases,
      pendingCases,
      activeCases,
      closedCases,
      resolutionRate:
        filteredCases.length === 0
          ? 0
          : Number(
              (
                (closedCases /
                  filteredCases.length) *
                100
              ).toFixed(2)
            ),
    },

    categories,
    locations,
    statuses,
    priorities,

    aiResults: analyses,

    latestCases: filteredCases
      .sort(
        (a, b) =>
          new Date(getDate(b)) -
          new Date(getDate(a))
      )
      .slice(0, 8)
      .map((item) => ({
        caseId: getCaseId(item),
        firId: getFirId(item),
        type: getType(item),
        location: getLocation(item),
        status: getStatus(item),
        priority: analyzePriority(item).priority,
        classification:
          classifyCase(item).category,
        filedDate: getDate(item),
      })),
  };
};

module.exports = {
  buildAnalytics,
};