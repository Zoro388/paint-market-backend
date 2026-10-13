
/*
|--------------------------------------------------------------------------
| LEGACY PAINTING ESTIMATE PAYMENT SERVICE
|--------------------------------------------------------------------------
|
| Painting estimates are now free.
|
| Inspection bookings must use their own separate payment service.
| This legacy service is retained temporarily for compatibility.
|--------------------------------------------------------------------------
*/

export const PAINTING_ESTIMATE_UNLOCK_FEE = 0;

export const initializePaintingEstimatePayment = async () => {
  throw new Error(
    "Painting estimates are free. Use the separate inspection booking flow for paid inspections.",
  );
};

export const verifyPaintingEstimatePayment = async () => {
  throw new Error(
    "Painting estimate payments are no longer supported.",
  );
};
