import { useCallback, useEffect, useRef, useState } from "react";
import "./SingleChatMessageContainer.css";
import { useAppStore } from "../../../store";
import { apiClient } from "../../../lib/api-client";
import { useSocket } from "../../../context/SocketContext";
import {
  DELETE_MESSAGE_FOR_EVERYONE_ROUTE,
  DELETE_MESSAGE_ROUTE,
  GET_ALL_MESSAGES_ROUTE,
  GET_GROUP_MESSAGES_ROUTE,
} from "../../../utils/constants";
import moment from "moment";
import { MdChatBubble } from "react-icons/md";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { PiClockFill } from "react-icons/pi";
import { getColor } from "../../../lib/group-member-color";
import ScrollToBottom from "../ScrollToBottom/scrollToBottom";
import { toast } from "react-toastify";

const SingleChatMessageContainer = () => {
  const socket = useSocket();
  const messageContainerRef = useRef();
  const scrollRef = useRef();
  const scrollProgressRef = useRef();
  const placeholderMessageRef = useRef();
  const [allDeletedForMe, setAllDeletedForMe] = useState([]);
  const [allDeletedForEveryone, setAllDeletedForEveryone] = useState([]);

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    selectedChatMembers,
    setSelectedChatMembers,
    uploadProgress,
    setUploadProgress,
    uploadTargetId,
    setUploadTargetId,
    uploadFileName,
    setUploadFileName,
    placeholderMessage,
    setPlaceholderMessage,
    showFileUploadPlaceholder,
    setShowFileUploadPlaceholder,
  } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getGroupMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_GROUP_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "group") {
        getGroupMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);


  const handleDeleteForEveryone = async (messageId) => {
    try {
      const t=await apiClient.post(DELETE_MESSAGE_FOR_EVERYONE_ROUTE, {
        messageId,
      });

      socket.emit("deleteMessageForEveryone", {
        messageId,
        userId: userInfo.id,
      });
      setAllDeletedForEveryone((prev) => [...prev, messageId]);
      toast.success("Message deleted for everyone");
    } catch (error) {
      toast.error("Failed to delete message for everyone");
    }
  };
  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "instant" });
  //   }
  // }, []);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "auto" });
  //     // scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [selectedChatData]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedChatMessages]);
  useEffect(() => {
    if (scrollProgressRef.current) {
      scrollProgressRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // }, [showFileUploadPlaceholder]);
  }, [uploadProgress]);
  useEffect(() => {
    if (placeholderMessageRef.current) {
      placeholderMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [placeholderMessage]);

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const checkIfImage = (filePath) => {
    // Extract the part before the query parameters
    const pathWithoutParams = filePath.split("?")[0];

    // Define regex to check if it ends with a valid image extension
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif|jfif)$/i;

    // Test the cleaned path
    return imageRegex.test(pathWithoutParams);
  };
 const handleDeleteForMe = useCallback(async (messageId) => {
    try {
      const res = await apiClient.post(DELETE_MESSAGE_ROUTE, { messageId });

      if (res.data.success) {
        setAllDeletedForMe((prev) => [...prev, messageId]);
        toast.success("Message deleted for you");
      }
    } catch (error) {
      toast.error("Failed to delete message for you");
    }
  }, [apiClient, DELETE_MESSAGE_ROUTE, setSelectedChatMessages]);
  const renderMessages = () => {
    let lastDate = null;
    if (!Array.isArray(selectedChatMessages)) return null;
    return selectedChatMessages.map((message) => {
      if (message.deletedForMe || allDeletedForMe.includes(message._id))
        return null;

      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;

      const isToday = moment().format("YYYY-MM-DD") === messageDate;

      const isYesterday =
        moment().subtract(1, "days").format("YYYY-MM-DD") === messageDate;

      const isThisWeek = moment().diff(moment(message.timestamp), "days") < 7;

      lastDate = messageDate;

      return (
        <div key={message._id}>
          {showDate && (
            <div className="general-date-container">
              <div className="general-date-line left"></div>
              <div className="general-date">
                {isToday
                  ? "Today"
                  : isYesterday
                  ? "Yesterday"
                  : isThisWeek
                  ? moment(message.timestamp).format("dddd")
                  : moment(message.timestamp).format("L")}
              </div>
              <div className="general-date-line right"></div>
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "group" && renderGroupMessages(message)}
        </div>
      );
    });
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", ""); // This forces a download -> Downloads with the original filename from the URL
    // link.setAttribute("download", "myFileName.extension"); // Downloads as "myImage.jpg" for example
    document.body.appendChild(link);
    link.click();
    // link.remove(); redundant -> below line already does the same thing
    document.body.removeChild(link);
  };

  const shortenFileName = (fileName, maxLength = 81) => {
    if (fileName.length <= maxLength) {
      return fileName; // No need to shorten
    }

    const startLength = 24; // Length of the start part
    const endLength = 24; // Length of the end part

    const start = fileName.slice(0, startLength); // First 24 characters
    const end = fileName.slice(-endLength); // Last 24 characters

    const totalLength = fileName.length; // Total length of the original file name
    const dotsCount = totalLength - startLength - endLength; // Calculate number of dots

    // Create dots string based on calculated number
    const dots = dotsCount > 0 ? ".".repeat(dotsCount) : "";

    return `${start}${dots}${end}`;
  };

  const getFileNameFromUrl = (fileName, maxLength = 81) => {
    if (!fileName) return "";

    // Find the last closing parenthesis ")"
    const lastClosingParenIndex = fileName.lastIndexOf(")");

    // Extract the file name part after the last closing parenthesis
    const cleanFileName =
      lastClosingParenIndex !== -1
        ? fileName.substring(lastClosingParenIndex + 1).trim()
        : fileName; // If no closing parenthesis, return the original file name

    return cleanFileName.length > maxLength
      ? cleanFileName.substring(0, maxLength) + "..."
      : cleanFileName;
  };

  const renderDMMessages = (message) => {
  const isDeleted =
    message.isDeletedForEveryone ||
    allDeletedForEveryone.includes(message._id);

  const isOwn = message.sender === userInfo.id;

  return (
    <div className={`message ${isOwn ? "own-message" : "contact-message"}`}>
      <div
        className={`${
          isOwn ? "own-message-content" : "contact-message-content"
        } message-content`}
      >
        <div className="user-pointer">
          <MdChatBubble className="user-pointer-icon" />
        </div>

        {/* ✅ DELETED */}
        {isDeleted ? (
          <i>This message was deleted</i>
        ) : (
          <>
            {/* TEXT */}
            {message.messageType === "text" && message.content}

            {/* FILE */}
            {message.messageType === "file" &&
              message.fileUrl && (
                <div>
                  {checkIfImage(message.fileUrl) ? (
                    <div
                      className="image-container"
                      onClick={() => {
                        setShowImage(true);
                        setImageURL(message.fileUrl);
                      }}
                    >
                      <img
                        src={message.fileUrl}
                        alt="chat-file"
                        style={{
                          width: "12.5rem",
                          height: "12.5rem",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="file-container">
                      <div className="file-icon-container">
                        <MdFolderZip className="file-icon" />
                      </div>

                      <div className="file-name">
                        {getFileNameFromUrl(
                          message.fileUrl.split("?")[0].split("/").pop()
                        )}
                      </div>

                      <div className="download-icon-container-link">
                        <a
                          onClick={() =>
                            handleDownload(message.fileUrl)
                          }
                        >
                          <IoMdArrowRoundDown className="download-icon" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </>
        )}

        {/* ACTIONS */}
        <div className="message-actions">
          <button onClick={() => handleDeleteForMe(message._id)}>
            Delete for me
          </button>

          {isOwn && !isDeleted && (
            <button
              onClick={() =>
                handleDeleteForEveryone(message._id)
              }
            >
              Delete for everyone
            </button>
          )}
        </div>

        {/* TIMESTAMP */}
        <div className="timestamp-container">
          <div className="message-timestamp">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    </div>
  );
};
  const renderGroupMessages = (message) => (
    <div
      className={`message group-message ${
        message.sender._id === userInfo.id ? "own-message" : "contact-message"
      }`}
    >
      {/* {console.log("selectedChatData")}
      {console.log(selectedChatData)} */}
      {message.sender._id === userInfo.id ? null : (
        <div className="contact-avatar">
          {message.sender.image ? (
            <div className="avatar">
              <img src={message.sender.image} alt="" />
            </div>
          ) : (
            <div className="no-avatar" style={{ color: "#53a6fd" }}>
              {message.sender.firstName && message.sender.lastName
                ? `${message.sender.firstName.charAt(
                    0
                  )} ${message.sender.lastName.charAt(0)}`
                : message.sender.firstName
                ? message.sender.firstName.charAt(0)
                : message.sender.lastName
                ? message.sender.lastName.charAt(0)
                : message.sender.email.charAt(0)}
            </div>
          )}
        </div>
      )}
      <div
        className={`${
          message.sender._id === userInfo.id
            ? "own-message-content"
            : "contact-message-content"
        } message-content`}
      >
        <div className="user-pointer">
          <MdChatBubble className="user-pointer-icon" />
        </div>
        {message.sender._id !== userInfo.id && (
          <div className="group-message-contact-info-above-content">
            <div
              className="contact-info"
              style={{ color: "#53a6fd" }}
            >{`${message.sender.firstName} ${message.sender.lastName}`}</div>
          </div>
        )}
        {message.messageType === "text" && message.content}
        {message.messageType === "file" && message.fileUrl && (
          <div>
            {checkIfImage(message.fileUrl) ? (
              <div
                className="image-container"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={message.fileUrl}
                  alt=""
                  style={{
                    width: "12.5rem",
                    height: "12.5rem",
                    // objectFit: "contain",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ) : (
              <div className="file-container">
                <div className="file-icon-container">
                  <MdFolderZip className="file-icon" />
                </div>
                <div className="file-name">
                  {getFileNameFromUrl(
                    message.fileUrl.split("?")[0].split("/").pop()
                  )}
                </div>
                <div className="download-icon-container-link">
                  <a
                    className="download-icon-container"
                    onClick={() => handleDownload(message.fileUrl)}
                  >
                    <IoMdArrowRoundDown className="download-icon" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className={`${
            message.messageType === "file" && checkIfImage(message.fileUrl)
              ? "image-timestamp"
              : message.messageType === "file" && !checkIfImage(message.fileUrl)
              ? "file-timestamp"
              : ""
          } timestamp-container`}
        >
          <div className="message-timestamp">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="message-container" ref={messageContainerRef}>
      {/* {selectedChatMessages.length > 0 ? ( */}
      {renderMessages()}
      {/* ) : (
        <div className="loading-chat-messages-container">
          Loading Messages...
        </div>
      )} */}
      {/* {showFileUploadPlaceholder && uploadTargetId === selectedChatData._id && ( */}
      {uploadProgress > 0 && uploadTargetId === selectedChatData._id && (
        <>
          <div className="message own-message">
            <div className="message-content own-message-content">
              <div className="user-pointer">
                <MdChatBubble className="user-pointer-icon" />
              </div>
              <div>
                <div className="file-container">
                  <div className="file-icon-container">
                    <MdFolderZip className="file-icon" />
                  </div>
                  <div className="file-name">
                    {`Uploading "${shortenFileName(
                      uploadFileName
                    )}": ${uploadProgress.toFixed(2)}%`}
                  </div>
                  <div className="download-icon-container-link">
                    <a
                      className="download-icon-container"
                      style={{ pointerEvents: "none" }}
                    >
                      <IoMdArrowRoundDown className="download-icon" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="timestamp-container file-timestamp">
                <div className="message-timestamp">
                  {/* {moment(message.timestamp).format("LT")} */}
                  {moment(Date.now()).format("LT")}
                </div>
              </div>
            </div>
          </div>
          {/* <div ref={scrollProgressRef} /> */}
          {/* <div ref={scrollRef} /> */}
        </>
      )}
      {/* {console.log("placeholderMessage:")}
      {console.log(placeholderMessage)} */}
      {placeholderMessage !== undefined && (
        // placeholderMessage !== null &&
        // placeholderMessage !== "" &&
        <>
          <div className="message own-message">
            <div className="message-content own-message-content">
              <div className="user-pointer">
                <MdChatBubble className="user-pointer-icon" />
              </div>
              {placeholderMessage}
              <div className="timestamp-container">
                <div className="message-timestamp">
                  {/* {moment(placeholderMessage.timestamp).format("LT")} */}
                  <PiClockFill />
                </div>
              </div>
            </div>
          </div>
          {/* <div ref={placeholderMessageRef} /> */}
        </>
      )}
      <div className="scroll-ref scroll-progress-ref" ref={scrollProgressRef} />
      <div
        className="scroll-ref placeholder-message-ref"
        ref={placeholderMessageRef}
      />
      <ScrollToBottom
        containerRef={messageContainerRef}
        targetRef={scrollRef}
      />
      <div className="scroll-ref" ref={scrollRef} />
    </div>
  );
};

export default SingleChatMessageContainer;
