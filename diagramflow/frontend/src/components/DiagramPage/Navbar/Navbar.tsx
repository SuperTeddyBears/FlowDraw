import {Dispatch, SetStateAction} from 'react';
import './Navbar.css';
import {handleHelpClick, serializeDiagram} from '../utils.ts';
import {connection} from "../connection.ts";
import {ExtendedDiagramElementProps} from "../Canvas/Canvas.tsx";

const Navbar = ({diagramElements, connectionElements, diagramName, setDiagramName}:
                {
                  diagramElements: ExtendedDiagramElementProps[],
                  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>,
                  connectionElements: connection[],
                  setConnectionElements: Dispatch<SetStateAction<connection[]>>,
                  diagramName: string,
                  setDiagramName: Dispatch<SetStateAction<string>>,
                }) => {
  const handleRename = () => {
    const newName = prompt('Enter new diagram name:', diagramName);
    if (newName) {
      setDiagramName(newName);
    }
  }

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="logo">flow<span>draw</span>.</div>
        <div className="drawing-title">
          <h1
          onDoubleClick={handleRename}
          >{diagramName}</h1>
          <div className="drawing-buttons">
            <button className="btn btn-primary" onClick={handleHelpClick}>File</button>
            <button className="btn btn-primary" onClick={handleHelpClick}>Edit</button>
            <button className="btn btn-primary" onClick={handleHelpClick}>View</button>
            <button className="btn btn-primary" onClick={handleHelpClick}>Help</button>
          </div>
        </div>
      </div>
      <div className="navbar-right">
        <button className="btn btn-share" onClick={() => serializeDiagram(diagramName, diagramElements, connectionElements)}>Share</button>
      </div>
    </div>
  );
};

export default Navbar;