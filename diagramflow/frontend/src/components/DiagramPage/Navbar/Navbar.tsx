import {Dispatch, SetStateAction} from 'react';
import './Navbar.css';
import {handleHelpClick, serializeDiagram} from './utils.ts';
import {connection} from "../connection.ts";
import {ExtendedDiagramElementProps} from "../Canvas/Canvas.tsx";

const Navbar = ({diagramElements, connectionElements}:
                {
                  diagramElements: ExtendedDiagramElementProps[],
                  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>,
                  connectionElements: connection[],
                  setConnectionElements: Dispatch<SetStateAction<connection[]>>
                }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="logo">flow<span>draw</span>.</div>
        <div className="drawing-title">
          <h1>Title of the drawing</h1>
          <div className="drawing-buttons">
            <button className="btn btn-primary" onClick={handleHelpClick}>File</button>
            <button className="btn btn-primary" onClick={handleHelpClick}>Edit</button>
            <button className="btn btn-primary" onClick={handleHelpClick}>View</button>
            <button className="btn btn-primary" onClick={handleHelpClick}>Help</button>
          </div>
        </div>
      </div>
      <div className="navbar-right">
        <button className="btn btn-share" onClick={() => serializeDiagram(diagramElements, connectionElements)}>Share</button>
      </div>
    </div>
  );
};

export default Navbar;