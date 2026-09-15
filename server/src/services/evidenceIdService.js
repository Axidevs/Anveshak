const generateEvidenceId = async () => {
  const year = new Date().getFullYear();

  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `EV-${year}-${randomNumber}`;
};

module.exports = generateEvidenceId;