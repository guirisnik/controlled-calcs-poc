import { useState } from "react";
import { Button } from "./components/Button";
import { List } from "./components/List";
import { SchematicsEditor } from "./SchematicsEditor";
import "./App.css";
import { Schematic } from "./types";
import { v4 as uuid } from "uuid";
import { Calculation } from "./Calculation";

function App() {
  const [schematicId, setSchematicId] = useState<string>("");
  const [view, setView] = useState("home");

  const handleCreateNewSchematic = () => {
    const id = uuid();
    setSchematicId(id);
    const newSchematic: Schematic = {
      id,
      name: `New Schematic ${id}`,
      nodes: [],
    };
    localStorage.setItem(`schematic-${id}`, JSON.stringify(newSchematic));
    setView("editor");
  };

  function getSchematics(): Array<Schematic> {
    const schematics: Array<Schematic> = [];
    for (const key in localStorage) {
      if (key.includes("schematic-")) {
        const schematicString = localStorage.getItem(key);
        if (schematicString != null) {
          schematics.push(JSON.parse(schematicString));
        }
      }
    }
    return schematics;
  }

  function handleClick(schematic: Schematic) {
    setSchematicId(schematic.id);
  }

  function handleEditSchematic() {
    setView("editor");
  }

  function handleOpenCalculation() {
    setView("calculation");
  }

  return view === "home" ? (
    <div className="w-full">
      <div className="buttons-container">
        <Button onClick={handleCreateNewSchematic}>Create New Schematic</Button>
        <Button onClick={handleEditSchematic} disabled={schematicId === ""}>
          Edit Schematic
        </Button>
        <Button onClick={handleOpenCalculation} disabled={schematicId === ""}>
          Open Calculation
        </Button>
      </div>
      <List handleClick={handleClick} schematics={getSchematics()} />
    </div>
  ) : view === "editor" ? (
    <SchematicsEditor schematicId={schematicId} />
  ) : (
    <Calculation schematicId={schematicId} />
  );
}

export default App;
