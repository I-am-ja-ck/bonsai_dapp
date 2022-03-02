import React, { useEffect, useState } from "react";
import "../assets/main.css";
import bonsai_bg from "../assets/beauty_render3_5.png";
import { NavBar, Delayed } from "./containers";
import { Link } from "react-router-dom";
import { SlideFade , Spinner} from '@chakra-ui/react';

// stories page will link in our stories here
const Stories = () => {
  //optimise image loading
  const [imageIsReady, setIsReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsReady(true);
    };
    img.src = bonsai_bg;
  }, []);

  return (
    <div>
      <NavBar />
      {!imageIsReady ? (
        <div className="bonsai__spinner">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="#17191e"
            color="#9d8144"
            size="xl"
          />
        </div>
      ) : null}
      {imageIsReady ? (
        <div>
          <SlideFade in={true} offsetY='20px'>
            <div className="bonsai__card">
              <img className="bonsai__image" src={bonsai_bg} />
              <div className="bonsai__card-content">
                <p>Featured!</p>
                <h3>Bonsai Warriors</h3>
              </div>
              <div className="bonsai__card-btn">
                <Link to="/bonsai-all">
                  <button type="button">View All</button>
                </Link>
              </div>
            </div>
          </SlideFade>
          <Delayed>
            <SlideFade in={true} offsetY='20px'>
              <div className="bonsai__card">
                <img className="bonsai__image" src={bonsai_bg} />
                <div className="bonsai__card-content">
                  <p>User Content!</p>
                  <h3>Community Stories</h3>
                </div>
                <div className="bonsai__card-btn">
                  <Link to="/community-stories">
                    <button type="button">View All</button>
                  </Link>
                </div>
              </div>
            </SlideFade>
          </Delayed>
        </div>
      ) : null}
    </div>
  );
};

export default Stories;
