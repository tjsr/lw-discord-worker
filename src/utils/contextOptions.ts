import { SlashCommandContext } from "@discord-interactions/core";

export const safeContextIntValue = (context: SlashCommandContext, optionName: string, defaultValue: number): number => {
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
