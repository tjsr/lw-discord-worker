import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageBuilder,
  SlashCommandBuilder
} from "@discord-interactions/builders";
import { Button, ButtonContext, ISlashCommand, SlashCommandContext } from "@discord-interactions/core";

type BuildingState = {
  buildingLevel: number;
  buildingName: string;
  interaction: string;
};

const MAX_LEVEL = 30;

class VerifyButton extends Button {
  constructor() {
    super(
      "verify",
      new ButtonBuilder().setEmoji({ name: "✅" }).setStyle(ButtonStyle.Primary),

      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        const embedMessage = new EmbedBuilder(`${ctx.user.username} verified the given details!`);
        return ctx.replyFollowup(new MessageBuilder(embedMessage));
      }
    );
  }
}

class CorrectionButton extends Button {
  constructor() {
    super(
      "flag",
      new ButtonBuilder().setEmoji({ name: "⚠️" }).setStyle(ButtonStyle.Secondary),
      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        const now = Date.now();
        const message = `Got objection from user ${ctx.user.id} at ${now}`;

        return ctx.replyFollowup(new MessageBuilder(message));
      }
    );
  }
}

class NextLevelButton extends Button {
  constructor() {
    super(
      "nextlevel",
      new ButtonBuilder().setEmoji({ name: "🔼" }).setStyle(ButtonStyle.Secondary),
      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        await ctx.fetchState();
        if (!ctx.state) {
          console.debug(`No state on PrevLevel button`);
        } else if (ctx.state.buildingLevel <= MAX_LEVEL) {
          ctx.state.buildingName = `Building was ${ctx.state.buildingLevel}`;
          ctx.state.buildingLevel += 1;
        }

        ctx.createGlobalComponent;

        const message = `${ctx.interactionId}=>${ctx.state.interaction}: Next level ${ctx.state.buildingLevel} details. ${ctx.state.buildingName}`;

        return ctx.replyUpdate(new MessageBuilder(message));
      }
    );
  }
}

class PrevLevelButton extends Button {
  constructor() {
    super(
      "prevlevel",
      new ButtonBuilder().setEmoji({ name: "🔽" }).setStyle(ButtonStyle.Secondary),
      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        await ctx.fetchState();
        if (!ctx.state) {
          console.debug(`No state on PrevLevel button`);
        } else if (ctx.state.buildingLevel > 1) {
          ctx.state.buildingName = `Building was ${ctx.state.buildingLevel}`;
          ctx.state.buildingLevel -= 1;
        }
        const message = `${ctx.interactionId}=>${ctx.state.interaction}: Prev level ${ctx.state.buildingLevel} details. ${ctx.state.buildingName}`;
        return ctx.replyUpdate(new MessageBuilder(message));
      }
    );
  }
}

export class Building implements ISlashCommand {
  public builder = new SlashCommandBuilder("building", "Get or update details on buildings.");

  public components = [new VerifyButton(), new CorrectionButton(), new PrevLevelButton(), new NextLevelButton()];

  public handler = async (ctx: SlashCommandContext): Promise<void> => {
    try {
      const buildingInfoState: BuildingState = {
        buildingLevel: 10,
        buildingName: "Building 1",
        interaction: ctx.interactionId
      };
      const cmdVerifyButton = await ctx.createComponent("verify", buildingInfoState);
      const cmdFlagButton = await ctx.createComponent("flag", buildingInfoState);
      const cmdPrevLevelButton = await ctx.createComponent("prevlevel", buildingInfoState);
      const cmdNextLevelButton = await ctx.createComponent("nextlevel", buildingInfoState);

      const now = Date.now();

      const message = `${ctx.interactionId}: Details for building level ${buildingInfoState.buildingLevel}. Show help? ${now}. Modified value.`;
      const actionRow = new ActionRowBuilder().addComponents(
        cmdVerifyButton,
        cmdFlagButton,
        cmdPrevLevelButton,
        cmdNextLevelButton
      );
      console.debug("Replying in handler for building command with message", message);
      return ctx.reply(new MessageBuilder(message).addComponents(actionRow));
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };
}
