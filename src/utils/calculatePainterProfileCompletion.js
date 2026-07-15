const calculatePainterProfileCompletion = ({
  bio,
  profileImage,
  portfolioImages,
  verificationVideo,
  skills,
  services,
  preferredBrands,
}) => {

  let completed = 0;

  if (bio) completed++;

  if (profileImage) completed++;

  if (
    portfolioImages &&
    portfolioImages.length > 0
  ) completed++;

  if (
    verificationVideo &&
    verificationVideo.url
  ) completed++;

  if (
    skills &&
    skills.length > 0
  ) completed++;

  if (
    services &&
    services.length > 0
  ) completed++;

  if (
    preferredBrands &&
    preferredBrands.length > 0
  ) completed++;

  const total = 7;

  return Math.round(
    (completed / total) * 100
  );

};

export default calculatePainterProfileCompletion;