import { DiscordApplication } from "@discord-interactions/core";

export const deleteLaunchCommands = async (app: DiscordApplication) => {
  const commands = await app.rest.getApplicationCommands(app.clientId);
  console.log(`Commands: ${commands.length}`);
  commands.forEach(async (command) => {
    if (![1, 2, 3].includes(command.type)) {
      console.log(`Existing command will not be deleted: ${command.id} ${command.name}`);
    } else {
      console.log(`Deleting command: ${command.id} ${command.name}`);
      const deleted = await app.rest.deleteApplicationCommand(app.clientId, command.id);
      console.log("Deleted command:", deleted);
    }
  });
};

export default deleteLaunchCommands;
