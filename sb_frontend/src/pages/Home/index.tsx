import "./index.css";
import React, { FC, useState } from "react";
import Card from "../../components/Card/";

type CardProp = {
  icon: string;
  title: string;
  desc: string;
};

const index: FC = () => {
  const [cardData, setCardData] = useState<CardProp>([
    {
      icon: "fa-solid fa-list-check",
      title: "Goals",
      desc: "finding it hard to get those academic goals,studybud goal setter festure makes trackibg yoir prigress to your goals easier thus aiding you get them and without losing the flow.",
    },
    {
      icon: "fa fa-chart-line",
      title: "Performance Tracking",
      desc: "finding it hard to get those academic goals,studybud goal setter festure makes trackibg yoir prigress to your goals easier thus aiding you get them and without losing the flow.",
    },
    {
      icon: "fa fa-users",
      title: "Find a bud",
      desc: "finding it hard to get those academic goals,studybud goal setter festure makes trackibg yoir prigress to your goals easier thus aiding you get them and without losing the flow.",
    },
    {
      icon: "fa fa-toolbox",
      title: "Resources hub",
      desc: "finding it hard to get those academic goals,studybud goal setter festure makes trackibg yoir prigress to your goals easier thus aiding you get them and without losing the flow.",
    },
    {
      icon: "fa fa-credit-card",
      title: "Earn",
      desc: "finding it hard to get those academic goals,studybud goal setter festure makes trackibg yoir prigress to your goals easier thus aiding you get them and without losing the flow.",
    },
  ]);
  return (
    <div className="main-container">
      <div className="hero-container">
        <div className="hero-info-container">
          <h1>
            Find <span>a buddie on your course</span> adventure.
          </h1>
          <p>
            StudyBuddy is a revolutionary app designed to enhance your academic
            journey by connecting you with the perfect study buddy. Seamlessly
            blending technology with collaboration,simplifying the process of
            finding like-minded peers to study with.
          </p>
          <button>
            Join us<i className="fa fa-fire"></i>
          </button>
        </div>
        <div className="img-container"></div>
      </div>
      <svg
        className="wave-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#f97316"
          fill-opacity="1"
          d="M0,160L0,32L130.9,32L130.9,224L261.8,224L261.8,128L392.7,128L392.7,160L523.6,160L523.6,96L654.5,96L654.5,96L785.5,96L785.5,192L916.4,192L916.4,64L1047.3,64L1047.3,224L1178.2,224L1178.2,64L1309.1,64L1309.1,64L1440,64L1440,320L1309.1,320L1309.1,320L1178.2,320L1178.2,320L1047.3,320L1047.3,320L916.4,320L916.4,320L785.5,320L785.5,320L654.5,320L654.5,320L523.6,320L523.6,320L392.7,320L392.7,320L261.8,320L261.8,320L130.9,320L130.9,320L0,320L0,320Z"
        ></path>
      </svg>
      <div className="features-container">
        <h1>Features</h1>
        <div className="cards-container">
          {cardData.map((card) => {
            return (
              <Card icon={card.icon} title={card.title} desc={card.desc} />
            );
          })}
        </div>
      </div>
      <svg
        className="wave-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#f97316"
          fill-opacity="1"
          d="M0,0L0,288L110.8,288L110.8,192L221.5,192L221.5,192L332.3,192L332.3,256L443.1,256L443.1,256L553.8,256L553.8,32L664.6,32L664.6,96L775.4,96L775.4,192L886.2,192L886.2,96L996.9,96L996.9,64L1107.7,64L1107.7,64L1218.5,64L1218.5,256L1329.2,256L1329.2,288L1440,288L1440,0L1329.2,0L1329.2,0L1218.5,0L1218.5,0L1107.7,0L1107.7,0L996.9,0L996.9,0L886.2,0L886.2,0L775.4,0L775.4,0L664.6,0L664.6,0L553.8,0L553.8,0L443.1,0L443.1,0L332.3,0L332.3,0L221.5,0L221.5,0L110.8,0L110.8,0L0,0L0,0Z"
        ></path>
      </svg>
      <div className="info-m-container">
        <div className="img-2-container"></div>

        <div className="info-container">
          <h1>
            Our <span>"Goal"</span>
          </h1>
          <p>
            Providing quality service for your all your education needs to get
            you up and running for hitting those gaols while on your grind.
          </p>
        </div>
      </div>
      <div className="testimonials-container">
        <h1>Testimonials</h1>
        <div className="t-container">
          <div className="testimonial">
            <i className="fa fa-user"></i>
            <h1>Dave</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
          </div>
          <div className="testimonial">
            <i className="fa fa-user"></i>
            <h1>Harvey</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
          </div>

          <div className="testimonial">
            <i className="fa fa-user"></i>
            <h1>Greg</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
          </div>
          <div className="testimonial">
            <i className="fa fa-user"></i>
            <h1>Kris</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
