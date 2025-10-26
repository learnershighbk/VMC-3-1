export const placeErrorCodes = {
  fetchError: 'PLACE_FETCH_ERROR',
  notFound: 'PLACE_NOT_FOUND',
  validationError: 'PLACE_VALIDATION_ERROR',
  createError: 'PLACE_CREATE_ERROR',
} as const;

export type PlaceErrorCode =
  (typeof placeErrorCodes)[keyof typeof placeErrorCodes];
