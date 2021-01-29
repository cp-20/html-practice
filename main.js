// Response for Uptime Robot
const func = require('./func.js');

// Discord bot implements
const discord = require('discord.js');
const client = new discord.Client();

client.on('ready', message =>
{
	console.log('bot is ready!');
});

client.on('message', message =>
{
	if(message.isMemberMentioned(client.user))
	{
		message.reply( '呼びましたか？' );
		return;
	}
});


client.login( 'jzBaxXaRrVRrGcXpkNYcCZxs-T-I2R-T' );