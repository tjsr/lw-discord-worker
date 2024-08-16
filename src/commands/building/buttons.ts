import { BuildingState, MAX_LEVEL, createBuildingInfoMessage, setNextDisabled, setPrevDisabled } from ".";
import { Button, ButtonContext } from "@discord-interactions/core";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, MessageBuilder } from "@discord-interactions/builders";

import { BuildingInfoMessageData } from "../../types";
import { getBuildingDataForLevel } from "./data";

export class PrevLevelButton extends Button {
  constructor() {
    super(
      "prevlevel",
      new ButtonBuilder().setLabel("Prev level").setEmoji({ name: "🔽" }).setStyle(ButtonStyle.Secondary),
      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        const messageFields = ctx.message.embeds[0].fields;
        const levelField = messageFields?.find((field) => field.name === "Level");
        const currentLevel = parseInt(levelField?.value || "1");
        const previousLevel = currentLevel - 1;

        try {
          const buildings: BuildingInfoMessageData = getBuildingDataForLevel(ctx.state.buildingName, previousLevel);
          const messageBuilder = createBuildingInfoMessage(buildings.currentBuilding, buildings.previousBuilding);

          setNextDisabled(ctx, false);
          setPrevDisabled(ctx, previousLevel < 1);

          messageBuilder.setComponents(ctx.message.components);
          return ctx.replyUpdate(messageBuilder);
        } catch (err: any) {
          return ctx.replyFollowup(new MessageBuilder(err.message));
        }
      }
    );
  }
}
export class NextLevelButton extends Button {
  constructor() {
    super(
      "nextlevel",
      new ButtonBuilder().setLabel("Next level").setEmoji({ name: "🔼" }).setStyle(ButtonStyle.Secondary),
      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        const messageFields = ctx.message.embeds[0].fields;
        const levelField = messageFields?.find((field) => field.name === "Level");
        const currentLevel = parseInt(levelField?.value || "1");
        const nextLevel = currentLevel + 1;

        try {
          const buildings: BuildingInfoMessageData = getBuildingDataForLevel(ctx.state.buildingName, nextLevel);
          const messageBuilder = createBuildingInfoMessage(buildings.currentBuilding, buildings.previousBuilding);

          setNextDisabled(ctx, nextLevel >= MAX_LEVEL);
          setPrevDisabled(ctx, false);

          messageBuilder.setComponents(ctx.message.components);
          return ctx.replyUpdate(messageBuilder);
        } catch (err: any) {
          return ctx.replyFollowup(new MessageBuilder(err.message));
        }
      }
    );
  }
}

export class CorrectionButton extends Button {
  constructor() {
    super(
      "flag",
      new ButtonBuilder().setLabel("Submit correction").setEmoji({ name: "📝" }).setStyle(ButtonStyle.Secondary),
      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        const now = Date.now();
        const message = `Got objection from user ${ctx.user.id} at ${now}`;

        return ctx.replyFollowup(new MessageBuilder(message));
      }
    );
  }
}

export class VerifyButton extends Button {
  constructor() {
    super(
      "verify",
      new ButtonBuilder().setLabel("Verify").setEmoji({ name: "✅" }).setStyle(ButtonStyle.Primary),

      async (ctx: ButtonContext<BuildingState>): Promise<void> => {
        const embedMessage = new EmbedBuilder(`${ctx.user.username} verified the given details!`);
        return ctx.replyFollowup(new MessageBuilder(embedMessage));
      }
    );
  }
}

