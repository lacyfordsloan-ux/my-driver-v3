import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = (): any => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          const a = args as any;
          if (a.where) {
            if (a.where.deletedAt === undefined) {
              a.where = { ...a.where, deletedAt: null };
            }
          } else {
            a.where = { deletedAt: null };
          }
          return query(a);
        },
        async findFirst({ model, operation, args, query }) {
          const a = args as any;
          if (a.where) {
            if (a.where.deletedAt === undefined) {
              a.where = { ...a.where, deletedAt: null };
            }
          } else {
            a.where = { deletedAt: null };
          }
          return query(a);
        },
        async findUnique({ model, operation, args, query }) {
          // findUnique doesn't support generic where, we usually handle this in findFirst or middleware
          // but for findUnique specifically, it requires unique identifiers.
          // Soft delete here is trickier. Often we switch to findFirst for soft-deleted unique lookups.
          return query(args);
        },
        async delete({ model, operation, args, query }) {
          const m = model as any;
          return (prisma as any)[m].update({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ model, operation, args, query }) {
          const m = model as any;
          return (prisma as any)[m].updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
