import { Client } from 'discord.js';
import { amonger } from './amonger';

const bot = new Client()
bot.login(process.env.BOT_TOKEN);
bot.on('ready', () => console.log(`Connected as ${bot.user.tag}`));
bot.on('message', message =>
{
	if(message.author.bot)
		return;

	amonger(message);
});
