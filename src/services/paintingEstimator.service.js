const BEDROOM_AREAS = {
  2: 135,
  3: 165,
  4: 195,
  5: 225,
  6: 255,
};

const EXTRA_RATES = {
  "Exterior Painting": 150000,
  "Ceiling Painting": 90000,
  "Fence / Perimeter Wall": 100000,
  "Gate Painting": 45000,
  "Doors & Frames": 60000,
  "Feature / Accent Walls": 50000,
  "Textured / Decorative Finish": 85000,
  "Waterproof / Damp Protection": 120000,
  "Repainting Existing Walls": 75000,
  None: 0,
};

const FINISH_MULTIPLIERS = {
  Budget: 1,
  "Mid-Range": 1.25,
  "High-End": 1.55,
};

const STATE_MULTIPLIERS = {
  Abia: 1,
  Adamawa: 1,
  "Akwa Ibom": 1.05,
  Anambra: 1.05,
  Bauchi: 0.95,
  Bayelsa: 1.05,
  Benue: 0.95,
  Borno: 0.95,
  "Cross River": 1.05,
  Delta: 1.05,
  Ebonyi: 0.95,
  Edo: 1.05,
  Ekiti: 0.95,
  Enugu: 1.05,
  "FCT - Abuja": 1.15,
  Gombe: 0.95,
  Imo: 1,
  Jigawa: 0.95,
  Kaduna: 1,
  Kano: 1,
  Katsina: 0.95,
  Kebbi: 0.95,
  Kogi: 0.95,
  Kwara: 1,
  Lagos: 1.2,
  Nasarawa: 1.05,
  Niger: 1,
  Ogun: 1.1,
  Ondo: 1,
  Osun: 0.95,
  Oyo: 1,
  Plateau: 1,
  Rivers: 1.1,
  Sokoto: 0.95,
  Taraba: 0.95,
  Yobe: 0.95,
  Zamfara: 0.95,
};

const MATERIAL_RATE_PER_SQM = 1800;
const LABOUR_RATE_PER_SQM = 1100;
const LITRES_PER_BUCKET = 20;

export const getAreaFromBedrooms = (bedrooms) => {
  const area = BEDROOM_AREAS[Number(bedrooms)];

  if (!area) {
    throw new Error("Invalid bedroom selection.");
  }

  return area;
};

export const calculatePaintingEstimate = ({
  bedrooms,
  finishLevel,
  location,
  extras = [],
}) => {
  const area = getAreaFromBedrooms(bedrooms);

  const finishMultiplier =
    FINISH_MULTIPLIERS[finishLevel];

  const stateMultiplier =
    STATE_MULTIPLIERS[location];

  if (!finishMultiplier) {
    throw new Error("Invalid finishing level.");
  }

  if (typeof stateMultiplier !== "number") {
    throw new Error("Invalid project state.");
  }

  const normalizedExtras = Array.isArray(extras)
    ? extras.filter(Boolean)
    : [];

  const extrasCost = normalizedExtras.reduce(
    (total, extra) =>
      total + (EXTRA_RATES[extra] || 0),
    0,
  );

  const materialCost =
    area *
    MATERIAL_RATE_PER_SQM *
    finishMultiplier *
    stateMultiplier;

  const labourCost =
    area *
    LABOUR_RATE_PER_SQM *
    finishMultiplier *
    stateMultiplier;

  const paintQuantity = Math.ceil(area / 10);

  const bucketQuantity = Math.ceil(
    paintQuantity / LITRES_PER_BUCKET,
  );

  const estimatedBudget = Math.round(
    materialCost +
      labourCost +
      extrasCost,
  );

  const lowEstimate = Math.round(
    estimatedBudget * 0.9,
  );

  const highEstimate = Math.round(
    estimatedBudget * 1.15,
  );

  let specification =
    "Standard emulsion paint with basic surface preparation and a practical finish.";

  if (finishLevel === "Mid-Range") {
    specification =
      "Better-quality paint, improved surface preparation and refined interior finishing.";
  }

  if (finishLevel === "High-End") {
    specification =
      "Premium paints, extensive surface preparation, feature finishes and higher-quality coatings.";
  }

  return {
    area,
    paintQuantity,
    bucketQuantity,
    litresPerBucket: LITRES_PER_BUCKET,
    materialCost: Math.round(materialCost),
    labourCost: Math.round(labourCost),
    extrasCost: Math.round(extrasCost),
    estimatedBudget,
    lowEstimate,
    highEstimate,
    specification,
  };
};

export const getExtraRates = () =>
  EXTRA_RATES;

export const getBedroomAreas = () =>
  BEDROOM_AREAS;