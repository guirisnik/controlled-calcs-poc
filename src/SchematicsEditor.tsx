import React, { useState, useRef, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  applyNodeChanges,
} from "reactflow";
import type { NodeChange, NodeMouseHandler, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { CUSTOM_NODE_TYPES, isCalculatedData, isUserInputData, isValidDataType } from "./types";
import type {
  Schematic,
  CalculatedData,
  CustomNodeData,
  CustomNodeType,
  UserInputData,
} from "./types";
import { v4 as uuid } from "uuid";

type DefaultNodeDefinition = {
  background: string;
  color: string;
  data: Omit<CustomNodeData, "label">;
};
const customNodesDefinition: Record<CustomNodeType, DefaultNodeDefinition> = {
  userInput: {
    background: "#a0c4ff",
    color: "#333",
    data: {
      dataType: "Text",
      options: [],
    },
  },
  calculated: {
    background: "#ffadad",
    color: "#333",
    data: {
      formula: "",
    },
  },
};

const CustomNodeFactory =
  ({
    background,
    color,
  }: Pick<typeof customNodesDefinition.userInput, "background" | "color">) =>
  ({ data }: NodeProps) =>
    (
      <div
        style={{
          padding: 10,
          borderRadius: 5,
          background,
          color,
          textAlign: "center",
          width: 100,
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {data.label}
      </div>
    );

const nodeTypes = {
  userInput: CustomNodeFactory(customNodesDefinition.userInput),
  calculated: CustomNodeFactory(customNodesDefinition.calculated),
};

type SchematicsEditorProps = {
  schematicId: string;
};

function SchematicsEditor({ schematicId }: SchematicsEditorProps) {
  const [schematic, setSchematic] = useState<Schematic>(() => {
    const schematicsString = localStorage.getItem(`schematic-${schematicId}`);
    if (schematicsString != null) {
      return JSON.parse(schematicsString);
    }
    return { id: schematicId, name: `New Schematic ${schematicId}`, nodes: [] };
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeData, setNodeData] = useState<CustomNodeData | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const sidebarRef = useRef(null);

  const saveSchematic = (schematic: Schematic) =>
    localStorage.setItem(
      `schematic-${schematic.id}`,
      JSON.stringify(schematic)
    );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setSchematic((s) => {
      const updatedSchematic = {
        ...s,
        nodes: applyNodeChanges(changes, s.nodes),
      };
      saveSchematic(updatedSchematic);
      return updatedSchematic;
    });
  }, []);

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNode(node);
    setNodeData(node.data);
  };

  const handleSchematicNameChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setSchematic((s) => {
      const updatedSchematic = {
        ...s,
        name: event.target.value,
      };
      saveSchematic(updatedSchematic);
      return updatedSchematic;
    });
  };

  const handleNodeLabelChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (nodeData) setNodeData({ ...nodeData, label: event.target.value });
    updateNodeData("label", event.target.value);
  };

  const handleDataTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    if (!isValidDataType(event.target.value)) return;
    if (nodeData) setNodeData({ ...nodeData, dataType: event.target.value });
    updateNodeData("dataType", event.target.value);
  };

  const handleSelectOptionsChangeFactory =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isUserInputData(nodeData)) return;

      const newOptions = [...nodeData.options];
      newOptions[index] = event.target.value;
      setNodeData({ ...nodeData, options: newOptions });
      updateNodeData("options", newOptions);
    };

  const handleAddSelectOption = () => {
    if (!isUserInputData(nodeData)) return;

    const newOptions = [...nodeData.options, ""];
    setNodeData({ ...nodeData, options: newOptions });
    updateNodeData("options", newOptions);
  };

  const handleFormulaChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (!isCalculatedData(nodeData)) return;

    setNodeData({ ...nodeData, formula: event.target.value });
    updateNodeData("formula", event.target.value);
  };

  const updateNodeData = (
    key: keyof UserInputData | keyof CalculatedData,
    value:
      | UserInputData[keyof UserInputData]
      | CalculatedData[keyof CalculatedData]
  ) => {
    setSchematic((s) => {
      const updatedSchematic = {
        ...s,
        nodes: s.nodes.map((n) =>
          n.id === selectedNode?.id
            ? { ...n, data: { ...n.data, [key]: value } }
            : n
        ),
      };
      saveSchematic(updatedSchematic);
      return updatedSchematic;
    });
  };

  const addBlock = (type: CustomNodeType) => {
    setSchematic((s) => {
      const updatedSchematic = {
        ...s,
        nodes: [
          ...s.nodes,
          {
            id: uuid(),
            type,
            position: { x: 0, y: 0 },
            data: {
              ...customNodesDefinition[type].data,
              label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
            },
          },
        ],
      };
      saveSchematic(updatedSchematic);
      return updatedSchematic;
    });
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (event: MouseEvent) => {
      const newWidth = startWidth + (event.clientX - startX);
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="w-full h-screen flex">
      {/* Resizable Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className="p-4 bg-gray-100 relative"
      >
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-gray-400"
          onMouseDown={handleMouseDown}
        />
        <label>Schematic Name</label>
        <Input
          value={schematic.name}
          onChange={handleSchematicNameChange}
          className="mb-4"
        />
        <h2 className="text-lg font-bold">Add Blocks</h2>
        {CUSTOM_NODE_TYPES.map((type) => (
          <Button
            key={type}
            className="w-full my-2"
            onClick={() => addBlock(type)}
          >
            Add {type.charAt(0).toUpperCase() + type.slice(1)} Block
          </Button>
        ))}
      </div>
      {/* React Flow Board */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={schematic.nodes}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      {/* Configuration Side Panel */}
      {selectedNode && nodeData && (
        <div className="w-1/4 p-4 bg-gray-200 border-l border-gray-300 absolute right-0 top-0 h-full flex flex-col config-panel">
          <h2 className="text-lg font-bold mb-4">Configure Node</h2>
          <label>Id</label>
          <Input value={selectedNode.id} className="mb-4" />
          <label>Name</label>
          <Input
            value={nodeData.label}
            onChange={handleNodeLabelChange}
            className="mb-4"
          />
          {selectedNode.type === "userInput" && isUserInputData(nodeData) && (
            <>
              <label>Data Type</label>
              <select
                value={nodeData.dataType || ""}
                onChange={handleDataTypeChange}
                className="mb-4"
              >
                {["Text", "Numeric", "Date", "Boolean", "Select"].map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  )
                )}
              </select>
              {nodeData.dataType === "Select" && (
                <>
                  <label>Options</label>
                  {(nodeData.options || []).map((opt, index) => (
                    <Input
                      key={index}
                      value={opt}
                      onChange={handleSelectOptionsChangeFactory(index)}
                      className="mb-2"
                    />
                  ))}
                  <Button onClick={handleAddSelectOption}>+ Add Option</Button>
                </>
              )}
            </>
          )}
          {selectedNode.type === "calculated" && isCalculatedData(nodeData) && (
            <>
              <label>Formula</label>
              <Input
                value={nodeData.formula || ""}
                onChange={handleFormulaChange}
                className="mb-4"
              />
            </>
          )}
          <Button
            onClick={() => {
              setSelectedNode(null);
            }}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

export { SchematicsEditor };
