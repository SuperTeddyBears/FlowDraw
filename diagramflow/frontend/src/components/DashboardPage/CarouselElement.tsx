import { Link } from "react-router-dom";
import diagram from "../../assets/dashboard_recent_diagram.png";

export function CarouselElement({ name }: { name: string }) {
  return (
    <Link to="/diagrampage" className="carousel-element">
      <img draggable={false} src={diagram} alt={name} />
      <p className="carousel-caption">{name}</p>
    </Link>
  );
}
