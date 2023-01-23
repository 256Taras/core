import { PrismaClient } from '../../../app-template/node_modules/@prisma/client';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class DatabaseClient extends PrismaClient {}
