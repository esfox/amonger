import { MessageEmbed } from 'discord.js';

/** @param {import('discord.js').Message} message */
export async function amonger(message)
{
	if(message.content !== '!amonger')
		return;

	const voiceChannel = message.member.voice.channel;
	if(! voiceChannel)
		return message.channel.send('You are not in a voice channel. Join a voice channel first.');

	if(message.client.started && message.client.started[voiceChannel.id])
		return message.channel.send('A game was already started in that voice channel.');

	if(! message.client.started)
		message.client.started = {};

	message.client.started[voiceChannel.id] = true;

	const embed = new MessageEmbed()
		.setColor('#FFDE2A')
		.setTitle(`Among Us started in [🔊 ${voiceChannel.name}]`)
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
			delete message.client.started[voiceChannel.id];
			reactions.stop();
			try
			{
				// await message.delete();
				await control.delete();
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
