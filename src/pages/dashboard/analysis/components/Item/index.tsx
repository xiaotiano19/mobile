import React,{useRef} from 'react'
import styles from './index.less'
const Item = (props:any) => {
    const textRef = useRef(null);
    let {chat,setText,handleTextRef,showCursor,pos} =props;
    const handleTextChange = (event:any) => {
      setText(event.target.innerText);
    };
  
    // 将DOM元素的引用通过props传递给父组件
    if (handleTextRef) {
      handleTextRef(textRef.current);
    }
 
    return (
        <li className={chat.role==='user'?styles.userChatWrapper:styles.assistantChatWrapper}>
          <div className={styles.divWrapper}>
            <div className={styles.leftDiv}>
              <img className={styles.imgContent} src={chat.role==='user'?'/images/01.jpg':'/images/02.jpeg'} />
            </div>
            <div className={styles.rightDiv} ref={chat.role==='assistant'?textRef:null} onChange={chat.role==='assistant'?handleTextChange:undefined} >{chat.value}</div>
            {showCursor?<div className={styles.cursor} style={{left:`calc(${pos.x}*1)`,top:`calc(${pos.y}*1)`}}></div>:null}
          </div>
        </li>
      );
}
 
export default Item;