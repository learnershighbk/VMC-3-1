export const reviewErrorCodes = {
  fetchError: 'REVIEW_FETCH_ERROR',
  notFound: 'REVIEW_NOT_FOUND',
  reviewNotFound: 'REVIEW_NOT_FOUND',
  validationError: 'REVIEW_VALIDATION_ERROR',
  createError: 'REVIEW_CREATE_ERROR',
  deleteError: 'REVIEW_DELETE_ERROR',
  placeNotFound: 'PLACE_NOT_FOUND',
  invalidPassword: 'INVALID_PASSWORD',
} as const;

export type ReviewErrorCode =
  (typeof reviewErrorCodes)[keyof typeof reviewErrorCodes];
