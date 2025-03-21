import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import diagram from "./assets/diagram.png";
import settings from "./assets/settings_icon.svg";

export function Dashboard() {
  const [slidePercentage, setSlidePercentage] = useState(25); // Default to 50% (for 2 elements)

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;

      if (windowWidth >= 1200) setSlidePercentage(25); // 2 elements visible
      else setSlidePercentage(100); // 1 element visible
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gradient-to-bl from-blue-100 to-blue-300 p-6 rounded-2xl shadow-xl">
      <div className="space-y-8 bg-gray-100 p-6 rounded-2xl shadow-xl"> {/* Space between divs */}

        {/* Header Section */}
        <div className="border-b-blue-300 border p-4 rounded-xl bg-gradient-to-bl from-blue-100 to-blue-300 shadow-sm">
          <div className="flex items-center justify-between text-xl font-bold text-gray-700">
            <span>{"Witaj <username>!"}</span>
            <img className="h-full max-h-10 border-2 p-0.5 rounded-md" src={settings} alt="Ustawienia" />
          </div>
        </div>

        {/* Carousel Section */}
        <div className="border-b-blue-300 border p-4 rounded-xl bg-gradient-to-bl from-blue-100 to-blue-300 shadow-sm space-y-8">
          <div className="text-xl font-bold text-gray-700">Ostatnie diagramy:</div>
          <div className="">
            <Carousel
              autoPlay={false}
              infiniteLoop={false}
              centerMode={true}
              showThumbs={false}
              centerSlidePercentage={slidePercentage}
            >
              <CarouselElement num={1} />
              <CarouselElement num={2} />
              <CarouselElement num={3} />
              <CarouselElement num={4} />
              <CarouselElement num={5} />
            </Carousel>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-200 text-center text-sm text-gray-600 py-2 border-t rounded-2xl flex flex-row justify-between">
        <div className="mx-8">
          <span className="font-bold text-blue-500">flow</span>
          <span className="text-black">draw.</span>
        </div>
        <div>
          Copyright © 2025 FlowDraw. Wszelkie prawa zastrzeżone.
        </div>
        <div className="mx-16"/>
      </div>
    </div>
  );
}


function CarouselElement({num}: {num: number}) {
  return (
    <div className={"w-[90%] mx-auto cursor-pointer border-b-blue-300 border-4 p-4 rounded-xl shadow-s"} onClick={()=> console.log('go to diagram page ' + num)}>
      <img src={diagram} alt={"diagram " + num} />
      <p className="text-xl text-black">Diagram {num}</p>
    </div>
  )
}
