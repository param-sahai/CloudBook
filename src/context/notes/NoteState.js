import React, { useState } from "react";
import NoteContext from "./NoteContext";

const NoteState = (props) => {
  const s1 = {
    name: "Param Sahai",
    class: "702",
  };
  const [state, setState] = useState(s1);
  const update = () =>{
    setTimeout(()=>{
        setState({
            name: "Param_i_am",
            class: "619", 
        })
    },1000);
  }
  return (
    <NoteContext.Provider value={{state, update}}>{props.children}</NoteContext.Provider>
  );
};
export default NoteState;
