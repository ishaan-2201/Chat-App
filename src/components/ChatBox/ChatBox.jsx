import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const { userData, chatUser, messagesId, messages, setMessages } =
    useContext(AppContext);
  const [input, setInput] = useState("");
  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
        const userIds = [userData.id, chatUser.rId];
        userIds.forEach(async (userId) => {
          const chatSnap = await getDoc(doc(db, "chats", userId));
          if (chatSnap.exists()) {
            const chatList = chatSnap.data().chatsData;
            const idx = chatList.findIndex(
              (item) => item.messageId === messagesId
            );
            chatList[idx].lastMessage = input.slice(0, 30);
            chatList[idx].updatedAt = Date.now();
            if (chatList[idx].rId === userData.id) {
              chatList[idx].messageSeen = false;
            }
            await updateDoc(doc(db, "chats", userId), {
              chatsData: chatList,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const imgUrl = await upload(e.target.files[0]);
      if (imgUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: imgUrl,
            createdAt: new Date(),
          }),
        });

        const userIds = [userData.id, chatUser.rId];
        userIds.forEach(async (userId) => {
          const chatSnap = await getDoc(doc(db, "chats", userId));
          if (chatSnap.exists()) {
            const chatList = chatSnap.data().chatsData;
            const idx = chatList.findIndex(
              (item) => item.messageId === messagesId
            );
            chatList[idx].lastMessage = "Image";
            chatList[idx].updatedAt = Date.now();
            if (chatList[idx].rId === userData.id) {
              chatList[idx].messageSeen = false;
            }
            await updateDoc(doc(db, "chats", userId), {
              chatsData: chatList,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours > 12) {
      return hours - 12 + ":" + minutes + " PM";
    } else {
      return hours + ":" + minutes + " AM";
    }
  };
  useEffect(() => {
    if (messagesId) {
      const unsub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unsub();
      };
    }
  }, [messagesId]);
  return chatUser ? (
    <div className="chat-box">
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} alt="" className="dot" />
          ) : null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
      </div>
      <div className="chat-msg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.sId === userData.id ? "s-msg" : "r-msg"}
          >
            {message["image"] ? (
              <img className="msg-img" src={message.image} alt="" />
            ) : (
              <p className="msg">{message.text}</p>
            )}
            <div>
              <img
                src={
                  message.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p>{convertTimestamp(message.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
