import type { Node } from "reactflow";

export const CUSTOM_NODE_TYPES = ["userInput", "calculated"] as const;
export type CustomNodeType = (typeof CUSTOM_NODE_TYPES)[number];

export const DATA_TYPES = [
  "Text",
  "Numeric",
  "Date",
  "Boolean",
  "Select",
] as const;
export type DataType = (typeof DATA_TYPES)[number];
export function isValidDataType(type: string): type is DataType {
  return DATA_TYPES.some((t) => t === type);
}

export type UserInputData = {
  label: string;
  dataType: DataType;
  options: Array<string>;
};
export type CalculatedData = {
  label: string;
  formula: string;
};
export type CustomNodeData = UserInputData | CalculatedData;

export function isCalculatedData(
  nodeData: CustomNodeData | null
): nodeData is CalculatedData {
  if (!nodeData) return false;
  if (!("label" in nodeData)) return false;
  if (!("formula" in nodeData)) return false;
  return true;
}

export function isUserInputData(
  nodeData: CustomNodeData | null
): nodeData is UserInputData {
  if (!nodeData) return false;
  if (!("label" in nodeData)) return false;
  if (!("dataType" in nodeData)) return false;
  if (!("options" in nodeData)) return false;
  return true;
}

export type Schematic = {
  id: string;
  name: string;
  nodes: Array<Node>;
};
