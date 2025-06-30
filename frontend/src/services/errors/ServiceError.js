export class ServiceError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = this.constructor.name;
    this.metadata = metadata;
    this.statusCode = metadata.statusCode || 500;
  }
}

export class BadRequestError extends ServiceError {
  constructor(message = "Invalid request", metadata = {}) {
    super(message, { statusCode: 400, ...metadata });
  }
}

export class ForbiddenRequestError extends ServiceError {
  constructor(message = "Action not allowed", metadata = {}) {
    super(message, { statusCode: 403, ...metadata });
  }
}

export class NotFoundError extends ServiceError {
  constructor(message = "Resource not found", metadata = {}) {
    super(message, { statusCode: 404, ...metadata });
  }
}
