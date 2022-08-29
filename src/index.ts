import { db } from './database/database';
import { bot } from './config';
import { AvByParser } from './parsers/av-by.parser';

const parser = new AvByParser("https://cars.av.by/volkswagen/passat-cc");
parser.getAllCars().subscribe((value) => console.log('cars', value));

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    console.log(first_name, last_name, username, 123);
    next();
});

bot.launch();