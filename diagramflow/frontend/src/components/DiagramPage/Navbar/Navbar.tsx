import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
import './Navbar.css';
import {serializeDiagram} from '../utils.ts';
import {connection} from "../connection.ts";
import {ExtendedDiagramElementProps} from "../Canvas/Canvas.tsx";
import {Link} from "react-router-dom";
import {useAuth} from "../../../contexts/AuthContext.tsx";
import EditIconBlack from '../../../assets/diagrampage_edit_icon_black.svg';
import EditIconBlue from '../../../assets/diagrampage_edit_icon_blue.svg';
import axios from "axios";

const Navbar = ({diagramElements, connectionElements, diagramName, setDiagramName, onExport}:
{
  diagramElements: ExtendedDiagramElementProps[],
  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>,
  connectionElements: connection[],
  setConnectionElements: Dispatch<SetStateAction<connection[]>>,
  diagramName: string,
  setDiagramName: Dispatch<SetStateAction<string>>,
  onExport: () => void,
}) => {
  const {user} = useAuth();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState(diagramName);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRename = () => {
    setNewDiagramName(diagramName);
    setIsRenameModalOpen(true);
  };

  const handleRenameSave = () => {
    if (newDiagramName.trim() !== '') {
      setDiagramName(newDiagramName.trim());
    }
    setIsRenameModalOpen(false);
  };

  const handleRenameCancel = () => {
    setIsRenameModalOpen(false);
  };

  const handleSave = async () => {
    const json = serializeDiagram(diagramName, diagramElements, connectionElements);
    const userId = user?.id;
    console.log(userId, json);
    const token = localStorage.getItem('flow_auth_token');
    if (!token) {
      console.error('Token not found');
      return;
    }
    await axios.post(
      '/api/user/save_diagram',
      {user: userId, data: json},
      {headers: {Authorization: `Bearer ${token}`}}
    );
  };

  // wywoływane po kliknięciu przycisku Save
  const onSaveClick = () => {
    setShowConfirm(true);
  };

  // użytkownik potwierdza zapis
  const confirmSave = () => {
    setShowConfirm(false);
    handleSave().then(() => setShowSuccess(true));
  };

  const cancelSave = () => setShowConfirm(false);
  const closeSuccess = () => setShowSuccess(false);

  useEffect(() => {
    if (isRenameModalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenameModalOpen]);

  return (
      <>
        <div className="navbar">
          <div className="navbar-left">
            <Link to={"/dashboard"}>
              <div className="logo">flow<span>draw</span>.</div>
            </Link>
            <div className="drawing-title">
              <div
                className="drawing-title-header"
                onDoubleClick={handleRename}
                onMouseEnter={() => setIsHoveringTitle(true)}
                onMouseLeave={() => setIsHoveringTitle(false)}
              >
                <h1 className="drawing-title-text">{diagramName}</h1>
                <img
                  src={isHoveringTitle ? EditIconBlue : EditIconBlack}
                  alt="Edit Diagram Name"
                  className="edit-icon"
                />
              </div>
              <button className="btn btn-share save-button" onClick={onSaveClick}>Save</button>
            </div>
          </div>
          <div className="navbar-right">
            <button className="btn btn-share" onClick={onExport}>Share</button>
          </div>
        </div>
        
        {/*Rename Modal*/}
        {isRenameModalOpen && (
          <div className="modal-overlay" onClick={handleRenameCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleRenameCancel}>×</button>
              <h2 className="modal-title">Diagram name:</h2>
              <input
                ref={inputRef}
                type="text"
                value={newDiagramName}
                onChange={(e) => setNewDiagramName(e.target.value)}
                className="modal-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSave();
                  if (e.key === 'Escape') handleRenameCancel();
                }}
              />
              <div className="modal-buttons">
                <button className="modal-button-cancel" onClick={handleRenameCancel}>Cancel</button>
                <button className="modal-button-save" onClick={handleRenameSave}>Change name</button>
              </div>
            </div>
          </div>
        )}

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