import {diagramType} from "../types/diagramType.ts";

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
    <div className="border-4 rounded-xl p-4 items-center justify-between space-x-8 cursor-pointer"
         onClick={handleOnClick}>
      <img className="max-h-32" src={image} alt="Diagram sieciowy"/>
      <div className="text-xl font-bold text-gray-700">{handleDiagramType(type)}</div>
    </div>
  )
}
