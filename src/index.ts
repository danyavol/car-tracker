import { bot } from './config';
import { sessionMiddleware } from './middlewares/session.middleware';

bot.use(sessionMiddleware);

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));