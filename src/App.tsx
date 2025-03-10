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
  const [schematics, setSchematics] = useState<Array<Schematic>>(getSchematics);
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
    const schematicsStored: Array<Schematic> = [];
    for (const key in localStorage) {
      if (key.includes("schematic-")) {
        const schematicString = localStorage.getItem(key);
        if (schematicString != null) {
          schematicsStored.push(JSON.parse(schematicString));
        }
      }
    }
    return schematicsStored;
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

  function handleClearSchematics() {
    localStorage.clear();
    setSchematics([]);
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
        <Button onClick={handleClearSchematics}>Clear Schematics</Button>
      </div>
      <List handleClick={handleClick} schematics={schematics} />
    </div>
  ) : view === "editor" ? (
    <SchematicsEditor schematicId={schematicId} />
  ) : (
    <Calculation schematicId={schematicId} />
  );
}

export default App;
