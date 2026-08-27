import { Image, Send, X } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null); //A ref in React is like a way to directly point to an HTML element so you can control it with JavaScript.
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file"); //if type of file is not image then show error message...
      return; //return if file is not image...
    }
    const reader = new FileReader(); //FileReader is an object that allows you to read the contents of a file.
    reader.onloadend=() => {
      //onloadend is an event that fires when the file reading process is completely finished, whether it was successful or encountered an error.
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file); //This is the crucial line that starts the file reading process.
    //readAsDataURL() tells the FileReader to read the file object and convert it into a Data URL representation.
  };
  const removeImage = () => {
    setImagePreview("");
    fileInputRef.current.value = ""; //This line resets the file input value to an empty string, which clears the selected file from the input.
  };
  const handleSendMessage = async (e) => {
    e.preventDefault(); //prevent the default form submission behavior, which would cause the page to refresh.
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clearing the input fields and image preview after sending the message
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
            flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {/* The ref helps us control the hidden file input programmatically, so when the user clicks the visible button, it acts as if they clicked the hidden input directly.*/}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef} //By adding ref={fileInputRef}, React makes fileInputRef.current point to the actual <input> element in the DOM.
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()} //When the user clicks the button, we programmatically "click" the hidden input by calling .click() on it using the ref. This opens the file picker dialog.
            //When you create a ref using useRef(null), its initial value is null.
            //Before the component mounts and React attaches the DOM element to the ref, fileInputRef.current is null.
            //If you call .click() on fileInputRef.current when it’s null, JavaScript will throw an error.
          >
            <Image size={20} />
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-circle md:btn-md "
            disabled={!text.trim() && !imagePreview} //become disable when there is no image and no text typed..
          >
            <Send size={22} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
