const User = require("../models/User");

const findBestOfficer = async (jurisdiction, specialization) => {
  const officers = await User.find({
    role: "POLICE",
    isAvailable: true,
    jurisdiction: jurisdiction,
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
};