import { APIApplicationCommandOptionChoice, APIEmbedField } from "discord-api-types/v10";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandGroupBuilder,
  EmbedBuilder,
  MessageBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SubcommandOption
} from "@discord-interactions/builders";
import { Button, ButtonContext, CommandGroup, SlashCommandContext } from "@discord-interactions/core";
import { KeyVal, setKeyval } from "../../db/keyval.js";
import { getBuildingData, getBuildingDataForLevel } from "./data.js";

import { BuildingInfoMessageData } from "../../types/index.js";

type BuildingState = {
  buildingLevel: number;
  buildingName: string;
  buildingCode: string;
  interaction: string;
};

const MAX_LEVEL = 30;
const MAX_BUILDING_INSTANCES = 5;

class VerifyButton extends Button {
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

class CorrectionButton extends Button {
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

const setActionButtonDisabled = (ctx: ButtonContext<BuildingState>, buttonId: string, disabled: boolean): void => {
  const actionRow = ctx.message.components?.find((component) => component.type === 1);
  const buttons = actionRow?.components.filter((component) => component.type === 2);

  if (buttons) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const button = buttons.find((button: any) => button.custom_id.startsWith(buttonId));
    if (button) {
      button.disabled = disabled;
    }
  }
};

const setNextDisabled = (ctx: ButtonContext<BuildingState>, disabled: boolean): void => setActionButtonDisabled(ctx, 'building.nextlevel', disabled);

const setPrevDisabled = (ctx: ButtonContext<BuildingState>, disabled: boolean): void => setActionButtonDisabled(ctx, 'building.prevlevel', disabled);

class NextLevelButton extends Button {
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

class PrevLevelButton extends Button {
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

const buildingChoices = (buildingTypes: BuildingLookup[]): APIApplicationCommandOptionChoice<string>[] => 
  buildingTypes.map((buildingType) => {
    return {
      name: buildingType.name,
      value: buildingType.value
    } as APIApplicationCommandOptionChoice<string>;
  });

type BuildingLookup = {
  name: string,
  value: string,
};

const defaultBuildings = [
  { name: "Headquarters", value: "hq" },
  { name: "Tech Center", value: "tech"},
  { name: "Barracks", value: "barracks" },
  { name: "Wall", value: "wall" },
  { name: "Gold Mine", value: "gold" },
  { name: "Iron Mine", value: "iron" },
  { name: "Farmland", value: "farm" },
  { name: "Protein Farm", value: "protein" },
  { name: "Virus Research Institute", value: "vri" },
  { name: "Tank Center", value: "tank" },
];

const getBuildingNameForType = (type: string): string => {
  const building = defaultBuildings.find((building) => building.value === type);
  return building?.name || type;
};

const defaultBuildingChoices:APIApplicationCommandOptionChoice<string>[] = buildingChoices(defaultBuildings);

const buildingTypeChoices = new SlashCommandStringOption("type", "The building type to display info on.").setRequired(true).addChoices(...defaultBuildingChoices);

const buildingStat = (building: any, fieldName: string, fieldLabel?: string, inline = false): APIEmbedField|undefined => {
  if (building[fieldName]) {
    const field: APIEmbedField = {
      name: fieldLabel || fieldName,
      value: building[fieldName].toString(),
      inline: inline
    };
    return field;
  }
  return undefined;
};

const upgradeStats = (prevLevelBuilding: any, currentLevelBuilding: any, fieldName: string, fieldLabel?: string): APIEmbedField|undefined => {
  if (currentLevelBuilding[fieldName]) {
    const upgradeLabel = (prevLevelBuilding?.[fieldName] ? `${prevLevelBuilding[fieldName]} ➡️ ` : '❓ ➡️ ') + currentLevelBuilding[fieldName];
    const field: APIEmbedField = {
      name: fieldLabel || fieldName,
      value: upgradeLabel,
      inline: false
    };
    return field;
  }
  return undefined;
};

const rssValue = (rss: number|string): string => {
  if (typeof rss === 'string') {
    return rss;
  }
  if (rss < 10000) {
    return rss.toString();
  }
  if (rss < 1000000) {
    return `${(rss / 1000).toFixed(1)}K`;
  }
  if (rss < 1000000000) {
    return `${(rss / 1000000).toFixed(1)}M`;
  }
  return `${(rss / 1000000000).toFixed(1)}G`;
};

const rssStat = (building: any, rssType: string, label?: string): APIEmbedField|undefined => {
  if (building[rssType]) {
    const rss: APIEmbedField = {
      name: label || rssType,
      value: rssValue(building[rssType]),
      inline: true
    };
    return rss;
  }
  return undefined;
};

const createBuildingInfoMessage = (currentBuilding, prevLevelBuilding): MessageBuilder => {
  const message = new EmbedBuilder(
    `${currentBuilding.Name} building level ${currentBuilding.ToLevel}.`
  )
  const embedFields:APIEmbedField[] = [
    buildingStat(currentBuilding, "ToLevel", "Level", true),
    rssStat(currentBuilding, "XP"),
    buildingStat(currentBuilding, "Building Prerequisite"),
    upgradeStats(prevLevelBuilding, currentBuilding, "UpgradePower", "Power"),
    upgradeStats(prevLevelBuilding, currentBuilding, "UpgradeOutput", "Output/hr"),
    upgradeStats(prevLevelBuilding, currentBuilding, "Production time"),
    rssStat(currentBuilding, "Iron"),
    rssStat(currentBuilding, "Food"),
    rssStat(currentBuilding, "Coins"),
    rssStat(currentBuilding, "Protein"),
    rssStat(currentBuilding, "Mutant Crystals"),
    buildingStat(currentBuilding, "Hero HP"),
    buildingStat(currentBuilding, "Hero Attack"),
    buildingStat(currentBuilding, "Time", "Time to upgrade (base)"),
  ].filter((field) => field !== undefined);

  message.setFields(embedFields);

  return new MessageBuilder(message);
};

const safeContextIntValue = (context: SlashCommandContext, optionName: string, defaultValue: number): number => {
  let option;
  try {
    if (!context.hasOption(optionName)) {
      return defaultValue;
    }
    option = context.getIntegerOption(optionName);
    if (option?.value) {
      return option.value;
    }
    return defaultValue;
  } catch (err) {
    console.warn("Failed what trying to get integer option", err);
    return defaultValue;
  }
};

export class Building extends CommandGroup {
  private _db: D1Database
  constructor(db: D1Database) {
    super(
      new CommandGroupBuilder("building", "A simple config command.")
        .addSubcommands(
          new SubcommandOption("list", "List all known building types."),
          new SubcommandOption("info", "Show details for a building type.")
            .addStringOption(buildingTypeChoices)
            .addIntegerOption(
              new SlashCommandIntegerOption("level", "The building level to display stats of.")
              .setMinValue(1)
              .setMaxValue(MAX_LEVEL)
              .setRequired(true)),
          new SubcommandOption("have", "Indicate a building type is owned.")
            .addStringOption(buildingTypeChoices)
            .addIntegerOption(
              new SlashCommandIntegerOption("level", "The building level to indicate ownership of.")
              .setMinValue(1)
              .setMaxValue(MAX_LEVEL)
              .setRequired(true))
            .addIntegerOption(
              new SlashCommandIntegerOption("number","The index of the building of this level owned.")
              .setMinValue(1)
              .setMaxValue(MAX_BUILDING_INSTANCES)
              .setRequired(false)),
        ),
      {
        list: {
          handler: async (context: SlashCommandContext) => {
            const message = `Known building types: ${defaultBuildingChoices.map((choice) => choice.name).join(", ")}`;
            return context.reply(new MessageBuilder(message));
          }
        },
        info: {
          handler: async (context: SlashCommandContext) => {
            return this.buildingInfoHandler(context);
            // const buildingType = context.getStringOption("type");
            // const buildingLevel = context.getIntegerOption("level");

            // const message = `Details for building type ${buildingType.value} at level ${buildingLevel.value}.`;
            // return context.reply(new MessageBuilder(message));
          }
        },
        have: {
          handler: async (context: SlashCommandContext) => {
            try {
            if (!context.hasOption("type")) {
              return context.reply(new MessageBuilder(`No building type provided.`));
            }  
            if (!context.hasOption("level")) {
              return context.reply(new MessageBuilder(`No building type provided.`));
            }
            const buildingType = context.getStringOption("type").value;
            const buildingName = getBuildingNameForType(buildingType);

            const buildingLevel = safeContextIntValue(context, "level", 25);
            const buildingNumber = safeContextIntValue(context, "number", 1);
            
            console.log('Got have request', buildingType, buildingLevel, buildingNumber);

            const user = context.user?.id;
            //const user = 'foo';
            const message = `Ok <@${context.user?.id}>, set your ${buildingName} (${buildingNumber}) as being at level ${buildingLevel}.`;
            const key = `user[${user}].building[${buildingType}][${buildingNumber}]`;
            
            return setKeyval(key, { buildingLevel: buildingLevel }, user, this._db).then((result: D1Result<KeyVal>) => {
              if (result.success) {
                return context.reply(new MessageBuilder(message));
              } else {
                console.log(`Got success=false when storing KeyVal for ${key}`, result);
                return context.reply(new MessageBuilder(`Failed while trying to store your building info for ${buildingName} at level ${buildingLevel}.`));
              }
            }).catch((err) => {
              console.log(`Failed while trying to write to keyval store for ${key}`, err);
              throw err;
            });
          } catch (haveErr: any) {
            console.log('Failed while trying to store building info', haveErr);
            return context.reply(new MessageBuilder(`Failed while trying to store your building info`));
          }
          }
        }
      });
      this.components = [new VerifyButton(), new CorrectionButton(), new PrevLevelButton(), new NextLevelButton()];
      this._db = db;
  }

  public buildingInfoHandler = async (ctx: SlashCommandContext): Promise<void> => {
    const searchBuildingValue: string = ctx.getStringOption("type").value;
    const searchBuildingLevel = ctx.getIntegerOption("level").value;

    const searchBuildingName: string|undefined = defaultBuildings.find((v) => v.value == searchBuildingValue)?.name;

    if (!searchBuildingName) {
      return ctx.reply(new MessageBuilder(`No building with type ${searchBuildingValue} was recognised.`));
    }

    let buildings: BuildingInfoMessageData;
    let messageBuilder: MessageBuilder;
    try {
      buildings = getBuildingDataForLevel(searchBuildingName, searchBuildingLevel);
      messageBuilder = createBuildingInfoMessage(buildings.currentBuilding, buildings.previousBuilding);
    } catch (err: any) {
      return ctx.reply(new MessageBuilder(err.message));
    }
  
    try {
      const buildingInfoState: BuildingState = {
        buildingLevel: buildings.currentBuilding.ToLevel,
        buildingName: buildings.currentBuilding.Name,
        buildingCode: searchBuildingValue,
        interaction: ctx.interactionId
      };
      const cmdVerifyButton = await ctx.createComponent("verify", buildingInfoState);
      const cmdFlagButton = await ctx.createComponent("flag", buildingInfoState);
      const cmdPrevLevelButton = await ctx.createComponent("prevlevel", buildingInfoState);
      const cmdNextLevelButton = await ctx.createComponent("nextlevel", buildingInfoState);

      const actionRow = new ActionRowBuilder().addComponents(
        cmdVerifyButton,
        cmdFlagButton,
        cmdPrevLevelButton,
        cmdNextLevelButton
      );
      console.debug("Replying in handler for building command with message", messageBuilder);
      return ctx.reply(messageBuilder.addComponents(actionRow));
    } catch (error) {
      console.error('Failed while creating reply to building info request', error);
      return Promise.reject(error);
    }
  };
}
