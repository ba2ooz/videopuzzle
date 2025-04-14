import { ServiceError, NotFoundError, BadRequestError, ForbiddenRequestError } from "../ServiceError";

export class ErrorInterceptor {
  static intercept(error) {
    if (!error) 
      return new ServiceError("Unknown error occurred", { originalError: error });

    // avoid double wrapping of rethrown errors
    if (error instanceof ServiceError) return error;

    const status = error.status || error.statusCode;

    // Handle PocketBase specific errors
    if (status === 400) {
      return new BadRequestError(undefined, { originalError: error });
    }

    if (status === 403) {
      return new ForbiddenRequestError(undefined, { originalError: error });
    }

    if (status === 404) {
      return new NotFoundError(undefined, { originalError: error });
    }

    // Handle other types of errors
    return new ServiceError("Unhandled error", {
      originalError: error,
      statusCode: status || 500,
    });
  }
}
