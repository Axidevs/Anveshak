const User = require("../models/User");

const normalizeJurisdiction = (jurisdiction) => {
  if (!jurisdiction) return null;

  const value = jurisdiction.toLowerCase().trim();

  const delhiKeywords = [
    "delhi",
    "rohini",
    "bpit",
    "pitampura",
    "dwarka",
    "saket",
    "karol bagh",
    "janakpuri",
    "shahdara",
    "laxmi nagar",
    "north delhi",
    "south delhi",
    "east delhi",
    "west delhi",
    "central delhi",
  ];

  if (
    delhiKeywords.some((keyword) =>
      value.includes(keyword)
    )
  ) {
    return "Delhi";
  }

  return jurisdiction.trim();
};

const findBestOfficer = async (jurisdiction, specialization) => {
  const normalizedJurisdiction =
    normalizeJurisdiction(jurisdiction);

  const officers = await User.find({
    role: "POLICE",
    isAvailable: true,
    jurisdiction: normalizedJurisdiction,
  }).sort({
    workload: 1,
  });

  if (officers.length === 0) {
    return null;
  }

  if (specialization) {
    const specializedOfficer = officers.find(
      (officer) =>
        officer.specialization &&
        officer.specialization.toLowerCase() ===
          specialization.toLowerCase()
    );

    if (specializedOfficer) {
      return specializedOfficer;
    }
  }

  return officers[0];
};

module.exports = {
  findBestOfficer,
  normalizeJurisdiction,
};