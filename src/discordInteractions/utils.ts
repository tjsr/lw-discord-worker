export const checkName = <T>(name: T): T => {
  if (typeof name === "string") {
    if (name.toLowerCase() !== name) throw new Error("Command group names must be lowercase");
  }
  return name;
};
