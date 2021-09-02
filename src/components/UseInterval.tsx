import React,{ useRef } from "react";
import { useEffect } from "react";

export function useInterval(callback:any,delay:any){
    const savedCallback=useRef<any>();
    useEffect(()=>{
         savedCallback.current = callback;
    },[callback]);

    useEffect(()=>{
        function tick(){
            savedCallback.current();
        }
        if (delay !==null){
            const id=setInterval(tick,delay);
            return ()=>{
                clearInterval(id);
            };
        }
    },[callback,delay]);
}