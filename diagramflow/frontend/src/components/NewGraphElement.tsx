import {diagramType} from "../types/diagramType.ts";
import {Link} from "react-router-dom";

export function NewGraphElement({image, type}: { image: string, type: diagramType }) {
  const handleOnClick = () => {
  
  }
  
  function handleDiagramType(type: diagramType): string {
    switch (type) {
      case diagramType.UML:
        return "Diagram UML";
      case diagramType.Flowchart:
        return "Flowchart";
      case diagramType.Network:
        return "Diagram sieciowy";
      default:
        return "";
    }
  }
  
  return (
    <div
      className="border-4 rounded-xl p-4 flex flex-col items-center space-y-4 cursor-pointer w-1/8"
      onClick={handleOnClick}
    >
      <Link to="/diagrampage" >
        <img className="max-h-32 object-contain" src={image} alt="Diagram sieciowy"/>
        <div className="text-xl font-bold text-gray-700 text-center">
          {handleDiagramType(type)}
        </div>
      </Link>
    </div>
  )
}
