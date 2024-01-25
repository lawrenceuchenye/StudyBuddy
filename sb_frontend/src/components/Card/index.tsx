import "./index.css";
import { FC } from "react";

type CardProp = {
  icon: string;
  title: string;
  desc: string;
};

//@ts-ignore
export const index: FC<CardProp> = ({ icon, title, desc }) => {
  return (
    <div className="card-container">
      <div className="card-header">
        <i className={icon}></i>
        <h1>{title}</h1>
      </div>
      <div className="card-info">
        <p>{desc}</p>
      </div>
    </div>
  );
};

export default index;
