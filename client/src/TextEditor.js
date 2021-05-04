import React, { useCallback, useEffect, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

var toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  ["bold", "italic", "underline", "strike"], // toggled buttons

  [{ color: [] }, { background: [] }],
  ["blockquote", "code-block"],

  [{ list: "ordered" }, { list: "bullet" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ align: [] }],

  ["clean"],
];

const TextEditor = () => {
  const { id: roomId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const LINK = "http://localhost:5000";
  useEffect(() => {
    const s = io(LINK);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  // for saving data to database
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  // on sending text change
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // for setting room
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.emit("get-document", roomId);

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
  }, [socket, quill, roomId]);

  ///creating editor..
  const editorRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    // wrapper = <div id="container" />
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      modules: { toolbar: toolbarOptions },
      theme: "snow",
    });

    // will disable till we load data from server and set content
    q.disable();
    q.setText("Loading....");
    setQuill(q);
  }, []);

  return <div className="container" ref={editorRef}></div>;
};

export default TextEditor;
