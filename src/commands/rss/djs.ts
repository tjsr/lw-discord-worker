import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { PARAM_RESOURCE_TYPE } from "../../commandOptions";

class RssSubcommandGroup extends SlashCommandSubcommandGroupBuilder {
  private rssSetSubcommand: SlashCommandSubcommandBuilder;
  private rssGetSubcommand: SlashCommandSubcommandBuilder;
  constructor() {
    super();
    this.rssSetSubcommand = new SlashCommandSubcommandBuilder();
    this.rssSetSubcommand
      .setName("set")
      .setDescription("Set the number of an RSS type currently possessed.")
      .addStringOption(
        new SlashCommandStringOption().setName(PARAM_RESOURCE_TYPE).setChoices()
      );
    this.rssGetSubcommand = new SlashCommandSubcommandBuilder();
    this.rssGetSubcommand.setName("get").setDescription("Retrieve the number of an RSS type currently possessed.");

    this.addSubcommands(rssSetSubcommand, rssGetSubcommand);

  }

  this.addSubcommands();
}


export class RSSCommandBuilder extends SlashCommandBuilder {
  private rssSubcommands: RssSubcommandGroup;
  constructor() {
    super();
    this.rssSubcommands = new RssSubcommandGroup();
    this
      .setName("rss")
      .setDescription("Manage resources data for a user.").addSubcommandGroup(this.rssSubcommands);
      .addStringOption((option) =>
        option
          .setName("user")
          .setDescription("The user to get the RSS data for.")
          .setRequired(true)
      );
  }
}