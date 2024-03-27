import { FC } from "react";

type userComponentProps = {
  username: string;
  full_name: string;
  uni_name: string;
  uni_address: string;
  level: string;
};

const index: FC<userComponentProps> = ({
  username,
  full_name,
  uni_name,
  uni_address,
  level,
}) => {
  return (
    <div className="user-info-card">
      <h1>Welcome back,{username}!!</h1>
      <div className="userprofile-card">
        <div className="userprofile-img-container"></div>
        <div className="userprofile-info-container">
          <h2>{full_name}</h2>
          <h3>{uni_name}</h3>
          <h4>{uni_address}</h4>
          <p>{level}</p>
        </div>
      </div>
    </div>
  );
};

export default index;
