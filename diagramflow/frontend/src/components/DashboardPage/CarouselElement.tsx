import { Link } from "react-router-dom";
import diagram from "../../assets/dashboard_recent_diagram.png";

export function CarouselElement({ num }: { num: number }) {
  return (
    <Link to="/diagrampage" className="carousel-element">
      <img draggable={false} src={diagram} alt={`Diagram ${num}`} />
      <p className="carousel-caption">Diagram {num}</p>
    </Link>
  );
}
