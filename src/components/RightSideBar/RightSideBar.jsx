import React, { useContext, useEffect, useState } from "react";
import "./RightSideBar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const RightSideBar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [messageImages, setMessageImages] = useState([]);
  useEffect(() => {
    let images = [];
    messages.map((msg) => {
      if (msg["image"]) {
        images.push(msg["image"]);
      }
    });
    setMessageImages(images);
  }, [messages]);
  return (
    <div className="rs">
      {chatUser && (
        <>
          <div className="rs-profile">
            <img src={chatUser.userData.avatar} alt="" />
            <h3>
              {chatUser.userData.name}{" "}
              {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
                <img src={assets.green_dot} alt="" className="dot" />
              ) : null}
            </h3>
            <p>{chatUser.userData.bio}</p>
          </div>
          <hr />
          <div className="rs-media">
            <p>Media</p>
            <div>
              {messageImages.map((item, index) => (
                <img
                  key={index}
                  src={item}
                  onClick={() => window.open(item)}
                  alt=""
                />
              ))}
            </div>
          </div>
        </>
      )}
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSideBar;
