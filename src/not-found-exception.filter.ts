import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(NotFoundExceptionFilter.name);

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    this.logger.warn('Route not found. Redirecting to 404 page.');

    response.redirect('/404');
  }
}
