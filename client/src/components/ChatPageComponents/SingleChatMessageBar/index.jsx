import { RiEmojiStickerLine } from "react-icons/ri";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
// import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";

import "./SingleChatMessageBar.css";
import { useAppStore } from "../../../store";
import { useSocket } from "../../../context/SocketContext";
import upload from "../../../lib/upload";
import { FaCross } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { UPLOAD_FILE_ROUTE } from "../../../utils/constants";
import { apiClient } from "../../../lib/api-client";

const SingleChatMessageBar = () => {
  //   const emojiRef = useRef();

  //   const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const socket = useSocket();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setRefreshChatList,
    setActiveChatId,
    setPlaceholderMessage,
    setShowFileUploadPlaceholder,
  } = useAppStore();

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  //   useEffect(() => {
  //     function handleClickOutside(event) {
  //       if (emojiRef.current && !emojiRef.current.contains(event.target)) {
  //         setEmojiPickerOpen(false);
  //       }
  //     }
  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, [emojiRef]);

  //   const handleAddEmoji = (emoji) => {
  //     setMessage((message) => message + emoji.emoji);
  //   };

  const messageInputRef = useRef();

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedChatData]);

  const handleSendMessage = async () => {
    // if (!message.trim()) return;

    // console.log(message);
    if (message.trim()) {
      if (selectedChatType === "contact") {
        socket.emit("sendMessage", {
          sender: userInfo.id,
          content: message,
          recipient: selectedChatData._id,
          messageType: "text",
          fileUrl: undefined,
        });
      } else if (selectedChatType === "group") {
        socket.emit("sendGroupMessage", {
          sender: userInfo.id,
          content: message,
          messageType: "text",
          fileUrl: undefined,
          groupId: selectedChatData._id,
        });
      }
      setActiveChatId(selectedChatData._id);
      setPlaceholderMessage(message);
      setMessage("");
      setRefreshChatList(true);
    } else {
      // FILE MESSAGE
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const fileUrl = res.data.fileUrl;

        socket.emit("sendMessage", {
          sender: userInfo.id,
          recipient: selectedChatData._id,
          messageType: "file",
          fileUrl,
        });

        // clear state
        setSelectedFile(null);
        setPreview(null);

        // reset input (IMPORTANT)
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const fileInputRef = useRef();
  const handleFileAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileAttachmentChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB");
      return;
    }

    setSelectedFile(file);

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);
  };
  //   const handleFileAttachmentChange = async (event) => {
  //   const file = event.target.files[0];

  //   if (!file) return;

  //   // ❗ preview show immediately
  //   const previewURL = URL.createObjectURL(file);
  //   setPreview(previewURL);

  //   try {
  //     if (file.size > 10 * 1024 * 1024) {
  //       alert("File size exceeds 10MB");
  //       return;
  //     }

  //     const fileUrl = await upload(file, selectedChatData._id);

  //     if (fileUrl) {
  //       if (selectedChatType === "contact") {
  //         socket.emit("sendMessage", {
  //           sender: userInfo.id,
  //           content: undefined,
  //           recipient: selectedChatData._id,
  //           messageType: "file",
  //           fileUrl,
  //         });
  //       } else {
  //         socket.emit("sendGroupMessage", {
  //           sender: userInfo.id,
  //           content: undefined,
  //           messageType: "file",
  //           fileUrl,
  //           groupId: selectedChatData._id,
  //         });
  //       }
  //     }

  //     // ❗ clear preview after send
  //     setPreview(null);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div className="message-bar">
      <div className="message-bar-icon currently-disabled-icon">
        {/* <div className="emoji-picker-icon" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}> */}
        {/* <div className="emoji-picker-icon" ref={emojiRef}> */}
        <div className="emoji-picker-icon">
          <RiEmojiStickerLine
          // onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
          />
          {/* <div className="emoji-picker" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div> */}
        </div>
      </div>
      <button className="message-bar-icon" onClick={handleFileAttachmentClick}>
        <GrAttachment />
      </button>
      <input
        type="file"
        className="attachment-hidden-input"
        ref={fileInputRef}
        onChange={handleFileAttachmentChange}
      />
      <div className="message-bar-searchbar">
        {preview ? (
          <div className="image-preview">
            <img
              src={preview}
              alt="preview"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            <MdCancel
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);

                // 🔥 IMPORTANT LINE
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              color="#FF0000"
            />
          </div>
        ) : (
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            ref={messageInputRef}
            onChange={(e) => setMessage(e.target.value)}
            className="message-bar-search-input"
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
      <div className="message-bar-icon" onClick={handleSendMessage}>
        <IoSend />
      </div>
    </div>
  );
};

export default SingleChatMessageBar;
