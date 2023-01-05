import { Service } from '../injector/decorators/service.decorator';
import { schedule } from 'node-cron';
import { Integer } from '../utils/types/integer.type';

@Service()
export class Scheduler {
  public schedule(pattern: string, callback: () => void): void {
    schedule(pattern, callback);
  }

  public interval(callback: () => void, milliseconds: Integer): void {
    setInterval(callback, milliseconds);
  }

  public timeout(callback: () => void, milliseconds: Integer): void {
    setTimeout(callback, milliseconds);
  }
}
