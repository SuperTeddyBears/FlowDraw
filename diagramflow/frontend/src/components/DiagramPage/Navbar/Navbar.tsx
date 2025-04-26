import { Dispatch, SetStateAction, useState } from 'react';
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
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
  };

  // wywoływane po kliknięciu przycisku Save
  const onSaveClick = () => {
    setShowConfirm(true);
  };

  // użytkownik potwierdza zapis
  const confirmSave = () => {
    setShowConfirm(false);
    handleSave();
    setShowSuccess(true);
  };

  const cancelSave = () => setShowConfirm(false);
  const closeSuccess = () => setShowSuccess(false);

  return (
      <>
        <div className="navbar">
          <div className="navbar-left">
            <Link to={"/dashboard"}>
              <div className="logo">flow<span>draw</span>.</div>
            </Link>
            <div className="drawing-title">
              <h1
                  onDoubleClick={handleRename}
              >{diagramName}</h1>
              <div className="drawing-buttons">
                <button className="btn btn-primary" onClick={onSaveClick}>Save</button>
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

        {/* Confirmation Modal */}
        {showConfirm && (
            <div className="modal-overlay">
              <div className="modal">
                <p>Czy na pewno chcesz zapisać diagram?</p>
                <div className="modal-buttons">
                  <button className="btn btn-primary" onClick={confirmSave}>
                    Tak
                  </button>
                  <button className="btn btn-secondary" onClick={cancelSave}>
                    Nie
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
            <div className="modal-overlay success">
              <div className="modal success-modal">
                <p>Gratulacje! Zapisano!</p>
                <button className="btn btn-primary" onClick={closeSuccess}>
                  OK
                </button>
              </div>
            </div>
        )}
      </>
  );
};

export default Navbar;