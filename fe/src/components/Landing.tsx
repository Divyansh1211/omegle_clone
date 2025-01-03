import { useState } from "react";

export const Landing = () => {
  const [name, setName] = useState("");
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Name"
        onChange={(e) => {
          setName(e.target.value);
        }}
      ></input>
      <button
        type="submit"
        onClick={() => {
          window.location.href = `/room?name=${name}`;
        }}
      >
        Join Room
      </button>
    </div>
  );
};
