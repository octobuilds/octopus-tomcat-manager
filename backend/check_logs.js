import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.auditLog.findMany({ where: { action: 'Kullanıcı Silindi' } });
  console.log("EXPLICIT AUDIT LOGS:");
  console.log(logs);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
