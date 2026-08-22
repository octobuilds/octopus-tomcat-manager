import Transport from 'winston-transport';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PrismaTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    
    // Winston info format: { level: 'info', message: '...', timestamp: '...', ...meta }
    try {
      const { level, message, ...metaData } = info;
      const cleanMessage = String(message).trim();
      const cleanLevel = String(level).toUpperCase().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''); // Remove ANSI colors from console format if any

      // En son kaydedilen aynı mesaja sahip logu bulalım (Deduplication)
      const lastLog = await prisma.logEvent.findFirst({
        where: { message: cleanMessage, level: cleanLevel },
        orderBy: { updatedAt: 'desc' }
      });

      if (lastLog) {
        // Eğer bu mesaj aynen varsa, sadece count'ı artırıp saati güncelleyelim.
        await prisma.logEvent.update({
          where: { id: lastLog.id },
          data: { 
            count: { increment: 1 },
            updatedAt: new Date()
          }
        });
      } else {
        // Yoksa yeni kayıt
        await prisma.logEvent.create({
          data: {
            level: cleanLevel,
            message: cleanMessage,
            metaData: Object.keys(metaData).length ? metaData : null,
            count: 1
          }
        });
      }
    } catch (err) {
      console.error('PrismaTransport Error:', err);
    }
    
    if (callback) {
      callback();
    }
  }
}

export default PrismaTransport;
