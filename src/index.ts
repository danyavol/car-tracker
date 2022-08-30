import { db } from './database/database';
import { bot } from './config';
import { AvByParser } from './parsers/av-by.parser';
import { combineLatest } from 'rxjs';
import { compareCars } from './services/compare.service';
import { isValidUrl } from './parsers/parser';

// const parser1 = new AvByParser("https://cars.av.by/filter?brands[0][brand]=1216&brands[0][model]=2074&condition[0]=2");

// const parser2 = new AvByParser("https://cars.av.by/filter?brands[0][brand]=1216&brands[0][model]=2074&engine_capacity[min]=2000&condition[0]=2");

// combineLatest([
//     parser1.getAllCars(),
//     parser2.getAllCars()
// ]).subscribe(([cars2, cars1]) => {
//     const compareResult = compareCars(cars1.cars, cars2.cars);
// });

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    console.log(first_name, last_name, username, 123);
    next();
});

bot.launch();