import diagram from "../assets/placeholder_diagram.png";

export function CarouselElement({num}: { num: number }) {
  const handleOnClick = () => {
  
  }
  
  return (
    <div className={"w-[90%] mx-auto cursor-pointer border-b-blue-300 border-4 p-4 rounded-xl flex flex-col"}
         onClick={handleOnClick}>
      <img src={diagram} alt={"diagram " + num}/>
      <p className="text-xl text-black flex flex-row justify-center">Diagram {num}</p>
    </div>
  )
}