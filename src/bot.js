/* API's */
const msu   = require('minecraft-server-util');
const fivem = require('fivem-server-api');

/* Libraries */
const config  = require('../config.json');
const discord = require('discord.js');
let client    = new discord.Client({
    intents: [
        discord.GatewayIntentBits.GuildMembers, 
        discord.GatewayIntentBits.MessageContent, 
        discord.GatewayIntentBits.Guilds 
    ]
});

/* Bot */
client.on(discord.Events.ClientReady, (u) =>
{
    console.log(`${u.user.tag} runned...`);
    var i = 0;
    setInterval(() =>
    {
        var status = config.list[i];
        switch (status.game)
        {
            case "Minecraft":
                msu.status(`${status.host}`, status.port, {}).then((data) =>
                {
                    var activity = status.status.replace('{ONLINE}', data.players.online).replace('{MAX}', data.players.max);
                    client.user.setPresence({activities: 
                        [{
                            name: activity,
                            type: discord.ActivityType.Playing
                        }]
                    });
                }).catch((e) =>
                {
                    client.user.setPresence({activities: 
                        [{
                            name: status.off,
                            type: discord.ActivityType.Playing
                        }]
                    });
                });
                break;
            case "FiveM":
                const server = new fivem.Server(`${status.host}:${status.port}`, {});
                Promise.all([server.getServerStatus(), server.getPlayers(), server.getMaxPlayers()]).then(([serverStatus, online, max]) =>
                {
                    var activity = (serverStatus ? status.status.replace('{ONLINE}', online).replace('{MAX}', max) : status.off);
                    client.user.setPresence({activities: 
                        [{
                            name: activity,
                            type: discord.ActivityType.Playing
                        }]
                    });           
                });
        }
        i += 1;
        if (i === config.list.length)
        {
            i = 0;
        }
    }, (config.cooldown * 1000));
});

client.login(config.token);