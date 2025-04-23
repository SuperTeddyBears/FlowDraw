import {Dispatch, SetStateAction} from 'react';
import './Navbar.css';
import {handleHelpClick, serializeDiagram} from '../utils.ts';
import {connection} from "../connection.ts";
import {ExtendedDiagramElementProps} from "../Canvas/Canvas.tsx";
import {Link} from "react-router-dom";
import {useAuth} from "../../../contexts/AuthContext.tsx";
import axios from "axios";

const Navbar = ({diagramElements, connectionElements, diagramName, setDiagramName}:
{
  diagramElements: ExtendedDiagramElementProps[],
  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>,
  connectionElements: connection[],
  setConnectionElements: Dispatch<SetStateAction<connection[]>>,
  diagramName: string,
  setDiagramName: Dispatch<SetStateAction<string>>,
}) => {
  const {user} = useAuth();
  
  const handleRename = () => {
    const newName = prompt('Enter new diagram name:', diagramName);
    if (newName) {
      setDiagramName(newName);
    }
  }
  
  const handleSave = async () => {
    const json = serializeDiagram(diagramName, diagramElements, connectionElements);
    const userId = user?.id;
    console.log(userId, json);
    const token = localStorage.getItem('flow_auth_token');
    if (!token) {
      console.error('Token not found');
      return;
    }
    axios.post(
      '/api/user/save_diagram',
      { user: userId, data: json },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => alert('Diagram saved successfully!'));
  }

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to={"/"}>
          <div className="logo">flow<span>draw</span>.</div>
        </Link>
        <div className="drawing-title">
          <h1
          onDoubleClick={handleRename}
          >{diagramName}</h1>
          <div className="drawing-buttons">
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
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