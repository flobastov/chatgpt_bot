import {Telegraf, session} from 'telegraf';
import {message} from 'telegraf/filters';
import {code} from 'telegraf/format';
import config from 'config';
import {ogg} from './ogg.js';
import {openai} from './openai.js';

const INITIAL_SESSION = {
    messages: [],
};

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('start', async (ctx) => {
    ctx.session = {...INITIAL_SESSION};
    ctx.reply('Жду вашего голосового или текстового сообщения...');
});

bot.command('new', async (ctx) => {
    ctx.session = {...INITIAL_SESSION};
    ctx.reply('Жду вашего голосового или текстового сообщения...');
});

bot.on(message('voice'), async (ctx) => {
    if (!ctx.session) {
        ctx.session = {...INITIAL_SESSION};
    }

    try {
        await ctx.reply(code('Сообщение принял. Жду ответа от сервера...'));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);
        const text = await openai.transcription(mp3Path);
        await ctx.reply(code(`Ваш запрос: ${text}`));
        ctx.session.messages.push({role: openai.roles.USER, content: text});
        const response = await openai.chat(ctx.session.messages);
        ctx.session.messages.push({role: openai.roles.ASSISTANT, content: response.content});
        await ctx.reply(response.content);
    } catch (e) {
        console.error('Error while voice message', e.message);
    }
});

bot.on(message('text'), async (ctx) => {
    if (!ctx.session) {
        ctx.session = {...INITIAL_SESSION};
    }

    try {
        await ctx.reply(code('Сообщение принял. Жду ответа от сервера...'));
        ctx.session.messages.push({role: openai.roles.USER, content: ctx.message.text});
        const response = await openai.chat(ctx.session.messages);
        ctx.session.messages.push({role: openai.roles.ASSISTANT, content: response.content});
        await ctx.reply(response.content);
    } catch (e) {
        console.error('Error while text message', e.message);
    }
});

bot.launch();

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.once(signal, () => bot.stop(signal)));


/**
 *  Name:  Free GPT Bot
 *  ID:    FreeLG96GptBot
 *  Token: 6004252589:AAF9FGgYaJUq_hyImQpO7G3KijrIZgKGlJw
 *  API:   https://core.telegram.org/bots/api
 *  https://youtu.be/-6ufFPvp6CY?t=4259
 */
