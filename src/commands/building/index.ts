import {
  ActionRowBuilder,
  CommandGroupBuilder,
  EmbedBuilder,
  MessageBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SubcommandOption
} from "@discord-interactions/builders";
import { BuildingInfoMessageData, TypeLookup } from "../../types/index.js";
import { ButtonContext, CommandGroup, SlashCommandContext } from "@discord-interactions/core";
import { CorrectionButton, NextLevelButton, PrevLevelButton, VerifyButton } from "./buttons.js";
import { KeyVal, setKeyval } from "../../db/keyval.js";

import { APIEmbedField } from "discord-api-types/v10";
import { getBuildingDataForLevel } from "./data.js";
import { rssValue } from "../../utils/formatters.js";
import { safeContextIntValue } from "../../utils/contextOptions.js";
import { setActionButtonDisabled } from "../../utils/buttons.js";

export type BuildingState = {
  buildingLevel: number;
  buildingName: string;
  buildingCode: string;
  interaction: string;
};

export const MAX_LEVEL = 30;
const MAX_BUILDING_INSTANCES = 5;

export const setNextDisabled = (ctx: ButtonContext<BuildingState>, disabled: boolean): void =>
  setActionButtonDisabled(ctx, "building.nextlevel", disabled);

export const setPrevDisabled = (ctx: ButtonContext<BuildingState>, disabled: boolean): void =>
  setActionButtonDisabled(ctx, "building.prevlevel", disabled);

const getNameForType = (options: TypeLookup[], type: string): string => {
  const building = options.find((building) => building.value === type);
  return building?.name || type;
};

const buildingStat = (
  building: any,
  fieldName: string,
  fieldLabel?: string,
  inline = false
): APIEmbedField | undefined => {
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

const upgradeStats = (
  prevLevelBuilding: any,
  currentLevelBuilding: any,
  fieldName: string,
  fieldLabel?: string
): APIEmbedField | undefined => {
  if (currentLevelBuilding[fieldName]) {
    const upgradeLabel =
      (prevLevelBuilding?.[fieldName] ? `${prevLevelBuilding[fieldName]} ➡️ ` : "❓ ➡️ ") +
      currentLevelBuilding[fieldName];
    const field: APIEmbedField = {
      name: fieldLabel || fieldName,
      value: upgradeLabel,
      inline: false
    };
    return field;
  }
  return undefined;
};

const rssStat = (building: any, rssType: string, label?: string): APIEmbedField | undefined => {
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

export const createBuildingInfoMessage = (currentBuilding, prevLevelBuilding): MessageBuilder => {
  const message = new EmbedBuilder(`${currentBuilding.Name} building level ${currentBuilding.ToLevel}.`);
  const embedFields: APIEmbedField[] = [
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
    buildingStat(currentBuilding, "Time", "Time to upgrade (base)")
  ].filter((field) => field !== undefined);

  message.setFields(embedFields);

  return new MessageBuilder(message);
};

const createBuildingHaveSubcommand = (buildingTypeOption: SlashCommandStringOption): SubcommandOption =>
  new SubcommandOption("have", "Indicate a building type is owned.")
    .addStringOption(buildingTypeOption)
    .addIntegerOption(
      new SlashCommandIntegerOption("level", "The building level to indicate ownership of.")
        .setMinValue(1)
        .setMaxValue(MAX_LEVEL)
        .setRequired(true)
    )
    .addIntegerOption(
      new SlashCommandIntegerOption("number", "The index of the building of this level owned.")
        .setMinValue(1)
        .setMaxValue(MAX_BUILDING_INSTANCES)
        .setRequired(false)
    );

const createBuildingInfoSubcommand = (buildingTypeOption: SlashCommandStringOption): SubcommandOption =>
  new SubcommandOption("info", "Show details for a building type.")
    .addStringOption(buildingTypeOption)
    .addIntegerOption(
      new SlashCommandIntegerOption("level", "The building level to display stats of.")
        .setMinValue(1)
        .setMaxValue(MAX_LEVEL)
        .setRequired(true)
    );

export class BuildingCommand extends CommandGroup {
  private _db: D1Database;
  private _buildingTypes: TypeLookup[];

  constructor(db: D1Database, buildingTypes: TypeLookup[], buildingTypeOption: SlashCommandStringOption) {
    super(
      new CommandGroupBuilder("building", "A simple config command.").addSubcommands(
        new SubcommandOption("list", "List all known building types."),
        createBuildingInfoSubcommand(buildingTypeOption),
        createBuildingHaveSubcommand(buildingTypeOption)
      ),
      {
        list: {
          handler: async (context: SlashCommandContext) => {
            const message = `Known building types: ${buildingTypes.map((choice) => choice.name).join(", ")}`;
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
              const buildingName = getNameForType(this._buildingTypes, buildingType);

              const buildingLevel = safeContextIntValue(context, "level", 25);
              const buildingNumber = safeContextIntValue(context, "number", 1);

              console.log("Got have request", buildingType, buildingLevel, buildingNumber);

              const user = context.user?.id;
              //const user = 'foo';
              const message = `Ok <@${context.user?.id}>, set your ${buildingName} (${buildingNumber}) as being at level ${buildingLevel}.`;
              const key = `user[${user}].building[${buildingType}][${buildingNumber}]`;

              return setKeyval(key, { buildingLevel: buildingLevel }, user, this._db)
                .then((result: D1Result<KeyVal>) => {
                  if (result.success) {
                    return context.reply(new MessageBuilder(message));
                  } else {
                    console.log(`Got success=false when storing KeyVal for ${key}`, result);
                    return context.reply(
                      new MessageBuilder(
                        `Failed while trying to store your building info for ${buildingName} at level ${buildingLevel}.`
                      )
                    );
                  }
                })
                .catch((err) => {
                  console.log(`Failed while trying to write to keyval store for ${key}`, err);
                  throw err;
                });
            } catch (haveErr: any) {
              console.log("Failed while trying to store building info", haveErr);
              return context.reply(new MessageBuilder(`Failed while trying to store your building info`));
            }
          }
        }
      }
    );
    this.components = [new VerifyButton(), new CorrectionButton(), new PrevLevelButton(), new NextLevelButton()];
    this._db = db;
    this._buildingTypes = buildingTypes;
  }

  public buildingInfoHandler = async (ctx: SlashCommandContext): Promise<void> => {
    const searchBuildingValue: string = ctx.getStringOption("type").value;
    const searchBuildingLevel = ctx.getIntegerOption("level").value;

    const searchBuildingName: string | undefined = this._buildingTypes.find(
      (v) => v.value == searchBuildingValue
    )?.name;

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
      console.error("Failed while creating reply to building info request", error);
      return Promise.reject(error);
    }
  };
}
