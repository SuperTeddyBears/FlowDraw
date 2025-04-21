import { Link } from "react-router-dom";
import diagram from "../../assets/dashboard_recent_diagram.png";
import {getDiagramName} from "../DiagramPage/utils.ts";

export function CarouselElement({ diagramData }: { diagramData: string }) {
  return (
    <Link to={{ pathname: "/diagrampage"}} state={{diagram: diagramData}} className="carousel-element">
      <img draggable={false} src={diagram} alt={getDiagramName(diagramData)} />
      <p className="carousel-caption">{getDiagramName(diagramData)}</p>
    </Link>
  );
}
