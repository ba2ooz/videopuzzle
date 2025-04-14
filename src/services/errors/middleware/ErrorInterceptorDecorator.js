import { ErrorInterceptor as ErrorInterceptor } from "./ErrorInterceptor";
import { catchError } from "../../../utils/utils";

export function interceptErrors(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args) {
    const [error, result] = await catchError(originalMethod.apply(this, args));

    if (error) {
      const interceptedError = ErrorInterceptor.intercept(error);
      interceptedError.metadata.context = `[${target.constructor.name}][${propertyKey}]`;

      throw interceptedError;
    }
    
    return result;
  };

  return descriptor;
}
