import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    let status = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      code = `HTTP_${status}`;
    } else if (exception && typeof exception === 'object' && 'type' in exception &&
        (exception.type === 'entity.parse.failed' || exception.type === 'entity.too.large')) {
      status = exception.type === 'entity.too.large' ? 413 : 400;
      message = status === 413 ? 'Request body is too large' : 'Invalid JSON body';
      code = `HTTP_${status}`;
    } else if (exception && typeof exception === 'object' && 'code' in exception) {
      if (exception.code === '23P01') {
        status = 409;
        message = 'This time overlaps an existing appointment or work window';
        code = 'SCHEDULE_CONFLICT';
      } else if (exception.code === '23505') {
        status = 409;
        message = 'Record already exists or idempotency key was already used';
        code = 'DUPLICATE_RECORD';
      } else if (exception.code === '23503') {
        status = 400;
        message = 'Referenced record does not exist';
        code = 'INVALID_REFERENCE';
      }
    }
    const response = host.switchToHttp().getResponse<Response>();
    if (status === 500) {
      // Do not log SQL details, tokens, request bodies or patient data.
      this.logger.error({ requestId: response.getHeader('X-Request-Id'), type: exception instanceof Error ? exception.name : 'UnknownError' });
    }
    response.status(status).json({ success: false, error: message, code });
  }
}
