import { useState } from "react";
import { Schematic } from "../types";

type TableProps = {
  schematics: Array<Schematic>;
  handleClick: (schematic: Schematic) => void;
};

function List({ schematics, handleClick }: TableProps) {
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {schematics.map((s) => (
            <tr
              key={s.id}
              className={selectedId === s.id ? "selected-row" : ""}
              onClick={() => {
                handleClick(s);
                setSelectedId(s.id);
              }}
            >
              <td>{s.id}</td>
              <td>{s.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { List };
