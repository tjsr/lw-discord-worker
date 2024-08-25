export type ResourceBoxSize = "R" | "SR" | "SSR" | "UR";
export const resourceBoxSizes = ["R", "SR", "SSR", "UR"];

export class ResourceValue {
  private _stringValue: string;
  private _numberValue: number;

  private static parseResourceAmountString = (amount: string): number => {
    const errorMesage = `Input resource value must be a numeric string, or value such as 3.21M, 50.2K`;
    if (amount == undefined || amount == null) {
      throw new Error(errorMesage);
    }
    if (typeof amount === "number") {
      console.log(`Expected input string value but was given a number - will use this verbatim.`);
      return amount;
    }

    if (typeof amount !== "string") {
      throw new Error(errorMesage);
    }

    amount = amount.trim();

    if (/^\d+$/.test(amount)) {
      return parseInt(amount);
    }

    const rssUnitsPattern = /^(\d+)\.(\d+)([GMK])$/;
    if (rssUnitsPattern.test(amount)) {
      const results = rssUnitsPattern.exec(amount);
      if (results) {
        const whole = parseInt(results[1]);
        const fraction = parseInt(results[2]);
        const unit = results[3];
        let multiplier = 1;
        switch (unit) {
          case "G":
            multiplier = 1000000000;
            break;
          case "M":
            multiplier = 1000000;
            break;
          case "K":
            multiplier = 1000;
            break;
          default:
            throw new Error(errorMesage);
        }
        return whole * multiplier + fraction * (multiplier / 10);
      }
    }

    if (amount.replace(/\d/g, "").length === 0) {
      throw new Error(errorMesage);
    }
    return parseInt(amount.replace(/\d/g, ""));
  };

  constructor(stringValue: string) {
    this._stringValue = stringValue;
    this._numberValue = ResourceValue.parseResourceAmountString(stringValue);
  }

  get intValue(): number {
    return this._numberValue;
  }

  get stringValue(): string {
    if (this._numberValue > 1000000000) {
      return `${(this._numberValue / 1000000000).toFixed(2)}G`;
    }
    if (this._numberValue > 1000000) {
      return `${(this._numberValue / 1000000).toFixed(2)}M`;
    }
    if (this._numberValue > 1000) {
      return `${(this._numberValue / 1000).toFixed(2)}K`;
    }
    return this._numberValue.toString();
  }
}
