import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageBuilder,
  SlashCommandBuilder
} from "@discord-interactions/builders";
import { Button, ButtonContext, ISlashCommand, SlashCommandContext } from "@discord-interactions/core";

type TestButtonState = {
  word: string;
};

export class PingCommand implements ISlashCommand {
  public builder = new SlashCommandBuilder("ping", "Simple ping command.");

  public handler = async (ctx: SlashCommandContext): Promise<void> => {
    console.log("Running ping command...");
    const button = await ctx.createComponent("pong");

    console.log("Created component...");
    const now = Date.now();

    console.log("Creating action row...");
    const actionRow = new ActionRowBuilder().addComponents(button);
    return ctx.reply(
      new MessageBuilder(
        new EmbedBuilder(
          `Pong! Signing --\`\`${ctx.receivedAt.getTime() - ctx.signedAt.getTime()}ms\`\`--> Received --\`\`${
            now - ctx.receivedAt.getTime()
          }ms\`\`--> Sending This Response (Total: \`\`${now - ctx.signedAt.getTime()}ms\`\`)`
        )
      ).addComponents(actionRow)
    );
  };

  public components = [
    new Button(
      "pong",
      new ButtonBuilder().setEmoji({ name: "🔍" }).setStyle(ButtonStyle.Primary),
      async (ctx: ButtonContext<TestButtonState>): Promise<void> => {
        const now = Date.now();

        return ctx.reply(
          new MessageBuilder(
            new EmbedBuilder(
              `Pong! Signing --\`\`${ctx.receivedAt.getTime() - ctx.signedAt.getTime()}ms\`\`--> Received --\`\`${
                now - ctx.receivedAt.getTime()
              }ms\`\`--> Sending This Response (Total: \`\`${now - ctx.signedAt.getTime()}ms\`\`)`
            )
          )
        );
      }
    )
  ];
}
