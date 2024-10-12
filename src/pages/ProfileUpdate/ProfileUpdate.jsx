import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const { setUserData } = useContext(AppContext);
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Upload Profile Picture");
      }
      const docRef = doc(db, "users", uid);
      if (file) {
        const imgUrl = await upload(file);
        setPrevImage(imgUrl);
        await updateDoc(docRef, {
          avatar: imgUrl,
          name,
          bio,
        });
      } else {
        await updateDoc(docRef, {
          name,
          bio,
        });
      }
      const userSnap = await getDoc(docRef);
      setUserData(userSnap.data());
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={handleSubmit}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept=".png, .jp, .jpeg"
              hidden
              onChange={handleFileChange}
            />
            <img src={image === "" ? assets.avatar_icon : image} alt="" />
            Upload profile image
          </label>
          <input
            type="text"
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
          <textarea
            placeholder="Write profile bio"
            required
            onChange={(e) => setBio(e.target.value)}
            value={bio}
          ></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={
            image === "" ? (prevImage ? prevImage : assets.logo_icon) : image
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;

//2:57
