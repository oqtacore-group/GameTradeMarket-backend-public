import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const { Client } = require('discord.js');

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly client: any;
  private invites: any;
  constructor(private configService: ConfigService) {
    this.client = new Client({
      intents: [1, 2],
    });
  }

  onApplicationBootstrap(): void {
    const SERVER_ID = this.configService.get<string>('DISCORD_SERVER_ID');
    const TOKEN_ID = this.configService.get<string>('DISCORD_TOKEN_BOT');

    this.client.once('ready', () => {
      // console.log(this.client.user.username + ' started!');

      const guild = this.client.guilds.cache.get(SERVER_ID);
      // console.log(`guild => ${guild}`);

      if (guild) {
        guild.invites.fetch().then((invs) => {
          // console.log(`invites => ${JSON.stringify(invs)}`);
          this.invites = invs;
        });
        //
        // guild.members.fetch().then((members) => {
        //   console.log(members);
        // });
      }
    });

    this.client.on('guildMemberAdd', async (member) => {
      if (member.guild.id !== SERVER_ID) {
        return null;
      }
      member.guild.invites.fetch().then((guildInvite) => {
        guildInvite.find((inv) => this.invites.get(inv.code).uses < inv);
        // console.log(member, member.id);
      });
    });

    void this.client.login(TOKEN_ID);
  }
}
