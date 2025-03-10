import { HyperFormula } from "hyperformula";
import { useState } from "react";
import { Schematic, UserInputData } from "./types";

type CalculationProps = {
  schematicId: string;
};

type ValueMap = Record<string, string | number>;

function Calculation({ schematicId }: CalculationProps) {
  const [inputValues, setInputValues] = useState<ValueMap>({});
  const [calculatedValues, setCalculatedValues] = useState<ValueMap>({});
  const [schematic] = useState<Schematic>(() => {
    const schematicString = localStorage.getItem(`schematic-${schematicId}`);
    if (!schematicString) throw new Error("No schematic found");
    return JSON.parse(schematicString);
  });

  const handleInputChange = (id: string, value: string | number) => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  const calculateResults = () => {
    const hf = HyperFormula.buildEmpty({ licenseKey: "gpl-v3" });
    const sheetName = "Sheet1";
    hf.addSheet(sheetName);

    // Define input values as named variables
    schematic.nodes.forEach((node) => {
      if (node.type === "userInput") {
        hf.addNamedExpression(node.data.label, inputValues[node.id] || 0);
      }
    });

    // Calculate results for calculated nodes
    const newCalculatedValues: ValueMap = {};
    schematic.nodes.forEach((node) => {
      if (node.type === "calculated") {
        try {
          const result = hf.calculateFormula(node.data.formula, 0);
          newCalculatedValues[node.id] = result as string;
        } catch (error) {
          console.error(error);
          newCalculatedValues[node.id] = "Error";
        }
      }
    });

    setCalculatedValues(newCalculatedValues);
  };

  return (
    <div>
      {schematic.nodes.map((node) => (
        <div key={node.id}>
          <label>{node.data.label}:</label>
          {node.type === "userInput" ? (
            node.data.dataType === "Select" ? (
              <select
                onChange={(e) => handleInputChange(node.id, e.target.value)}
              >
                {(node.data as UserInputData).options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={
                  node.data.dataType.toLowerCase() === "numeric"
                    ? "number"
                    : node.data.dataType.toLowerCase()
                }
                onChange={(e) => handleInputChange(node.id, e.target.value)}
              />
            )
          ) : node.type === "calculated" ? (
            <span>{calculatedValues[node.id] ?? ""}</span>
          ) : null}
        </div>
      ))}
      <button onClick={calculateResults}>Calculate</button>
    </div>
  );
}

export { Calculation };
