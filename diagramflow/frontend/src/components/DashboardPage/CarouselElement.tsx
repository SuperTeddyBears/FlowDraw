import diagram from "../../assets/placeholder_diagram.png";
import {Link} from "react-router-dom";

export function CarouselElement({num}: { num: number }) {
  return (
    <Link to="/diagrampage">
      <div className={"w-[90%] mx-auto cursor-pointer  flex flex-col"}>
        <img draggable={false} src={diagram} alt={"diagram " + num}/>
        <p className="text-xl text-black flex flex-row justify-center">Diagram {num}</p>
      </div>
    </Link>
  )
}
