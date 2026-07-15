const parseArrayField = (field) => {

  if (!field) return [];

  // Already an array
  if (Array.isArray(field)) {
    return field;
  }

  // JSON string
  try {

    const parsed = JSON.parse(field);

    if (Array.isArray(parsed)) {
      return parsed;
    }

  } catch (err) {}

  // Comma separated string
  if (typeof field === "string") {

    return field
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

  }

  return [];

};

export default parseArrayField;