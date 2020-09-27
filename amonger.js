import { MessageEmbed } from 'discord.js';

/** @param {import('discord.js').Message} message */
export async function amonger(message)
{
	if(message.content !== '!amonger')
		return;

	if(! message.member.voice.channel)
		return message.channel.send('You are not in a voice channel. Join a voice channel first.');

	const embed = new MessageEmbed()
		.setColor('#FFDE2A')
		.setTitle(`Among Us started in [🔊 ${message.member.voice.channel.name}]`)
		.setDescription(
			'Click 🔇 to mute everyone.\n'
			+ 'Click 🗣️ to unmute everyone.\n'
			+ 'Click 🛑 if the game has ended.'
		);

	const control = await message.channel.send({ embed });
	await Promise.all(
	[
		control.react('🔇'),
		control.react('🗣️'),
		control.react('🛑'),
	]);

	const reactions = control.createReactionCollector(
		({ emoji }, user) =>
			user.id === message.author.id && [ '🔇', '🗣️', '🛑' ].includes(emoji.name),
		{ dispose: true, time: 18000000 },
	);

	const onReact = async ({ emoji }) =>
	{
		if(emoji.name === '🛑')
		{
			reactions.stop();
			try
			{
				message.delete();
				control.delete();
			}
			catch(error)
			{
				message.channel.send('Game has ended.');
			}

			return;
		}

		const toMute = emoji.name === '🔇';
		const members = [ ...message.member.voice.channel.members.values() ];
		for(const member of members)
			await member.voice.setMute(toMute);
	};

	reactions.on('collect', onReact);
	reactions.on('remove', onReact);
}
