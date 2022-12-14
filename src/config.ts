import { FirebaseOptions } from "firebase/app";
import { Scenes, Telegraf } from "telegraf";

require('dotenv').config();

export const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID
};
export const firebaseAuth = {
    login: process.env.FB_EMAIL,
    password: process.env.FB_PASS
};

export const { TG_BOT_TOKEN } = process.env;

export const bot = new Telegraf<Scenes.WizardContext>(TG_BOT_TOKEN);