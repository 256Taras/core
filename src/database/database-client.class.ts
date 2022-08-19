import { PrismaClient, User } from '../../../norther/node_modules/@prisma/client';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class DatabaseClient extends PrismaClient {}

export type AuthUser = User;
