import { BuildingState } from "../commands/building";
import { ButtonContext } from "@discord-interactions/core";

export const setActionButtonDisabled = (ctx: ButtonContext<BuildingState>, buttonId: string, disabled: boolean): void => {
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
