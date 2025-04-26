import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): {isAlive: boolean} {
    return {isAlive: true};
  }
}
