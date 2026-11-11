import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception?.code === 'LIMIT_FILE_SIZE') {
      const res = host.switchToHttp().getResponse<Response>();
      res.status(413).json({
        statusCode: 413,
        message: 'File too large (max 5 MB)',
      });
      return;
    }
    throw exception;
  }
}
