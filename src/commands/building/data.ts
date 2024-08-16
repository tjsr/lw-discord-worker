import { BuildingInfoMessageData } from '../../types';
import BuildingUpgradeData from '../../json/BuildingUpgradeData.json';

export const getBuildingData = (buildingType: string): any[] => {
  return BuildingUpgradeData.filter((building) => building.Name === buildingType);
};

const getBuildingForLevel = (building: any[], buildingType: string, level: number): any => {
  const currentBuilding = building.filter((building) => {
    const levelInt = typeof building?.ToLevel === 'string' ? parseInt(building?.ToLevel) || 1 : building?.ToLevel;
    return levelInt === level;
  });

  if (!currentBuilding || currentBuilding.length === 0) {
    if (level === 1) {
      return undefined;
    }
    throw new Error(`No building data found for ${buildingType} at level ${level}.`);
  }
  if (currentBuilding?.length > 1) {
    throw new Error(`Multiple building data found for the ${buildingType} at level ${level}.`);
  }

  return currentBuilding[0];
};

export const getBuildingDataForLevel = (buildingType: string, level: number): BuildingInfoMessageData => {
  const building: any[] = getBuildingData(buildingType);
  if (!building) {
    throw new Error(`Building ${buildingType} not found`);
  }

  const currentBuilding = getBuildingForLevel(building, buildingType, level);
  const previousBuilding = level > 1 ? getBuildingForLevel(building, buildingType, level-1) : undefined;

  return {
    currentBuilding: currentBuilding,
    previousBuilding: previousBuilding,
    currentLevel: currentBuilding?.ToLevel,
    previousLevel: previousBuilding?.ToLevel
  };
};
