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

const LOCATION_MULTIPLIERS = {
  "Lagos Mainland": 1,

  "Lagos Mainland — Premium Areas": 1.15,

  "Lekki / Ajah / Sangotedo": 1.2,

  "Victoria Island / Ikoyi": 1.3,

  Abuja: 1.15,

  "Other Nigerian City": 1,
};

const MATERIAL_RATE_PER_SQM = 1800;
const LABOUR_RATE_PER_SQM = 1100;

const LITRES_PER_BUCKET = 20;

export const getAreaFromBedrooms = (bedrooms) => {
  const area = BEDROOM_AREAS[Number(bedrooms)];

  if (!area) {
    throw new Error(
      "Invalid bedroom selection.",
    );
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

  const locationMultiplier =
    LOCATION_MULTIPLIERS[location];

  if (!finishMultiplier) {
    throw new Error(
      "Invalid finishing level.",
    );
  }

  if (
    typeof locationMultiplier !== "number"
  ) {
    throw new Error(
      "Invalid project location.",
    );
  }

  const normalizedExtras = Array.isArray(extras)
    ? extras.filter(Boolean)
    : [];

  const extrasCost = normalizedExtras.reduce(
    (total, extra) => {
      return (
        total +
        (EXTRA_RATES[extra] || 0)
      );
    },
    0,
  );

  const materialCost =
    area *
    MATERIAL_RATE_PER_SQM *
    finishMultiplier *
    locationMultiplier;

  const labourCost =
    area *
    LABOUR_RATE_PER_SQM *
    finishMultiplier *
    locationMultiplier;

  // Temporary calculation.
  // This will be replaced once the final
  // PaintMarket calculation specification
  // is supplied.
  const paintQuantity = Math.ceil(
    area / 10,
  );

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

  const specification =
    finishLevel === "High-End"
      ? "Premium paints, extensive surface preparation, feature finishes and higher-quality coatings."
      : finishLevel === "Mid-Range"
        ? "Better-quality paint, improved surface preparation and refined interior finishing."
        : "Standard emulsion paint with basic surface preparation and a practical finish.";

  return {
    area,
    paintQuantity,
    bucketQuantity,
    litresPerBucket:
      LITRES_PER_BUCKET,
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