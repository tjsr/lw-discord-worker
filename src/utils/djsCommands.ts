import { REST, Routes, SlashCommandBuilder } from "discord.js";

export const createCommandList = (...list: SlashCommandBuilder[]) => {
  list.map((command) => command.toJSON());
};

export const createRestToken = (token: string): REST => {
  if (!token) {
    throw new Error("Token is required to create REST client.");
  }
  const rest = new REST().setToken(token);
  return rest;
};

export const registerDjsCommands = async (
  rest: REST,
  clientId: string,
  guildId: string | undefined,
  ...builderList: SlashCommandBuilder[]
) => {
  if (!clientId || !guildId) {
    throw new Error("Client ID and Guild ID are required to register commands.");
  }
  const commandList = createCommandList(...builderList);
  try {
    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandList });
    const commandsCountReturned = (data as any).length;
    if (commandsCountReturned !== builderList.length) {
      throw new Error(
        `Got a successful registration response, but with ${commandsCountReturned} when ${builderList.length} were expected`
      );
    }
    console.log(`Successfully registered ${commandsCountReturned} application commands.`);
  } catch (error) {
    console.error(`Failed to register application commands: ${error}`);
    throw error;
  }
};
