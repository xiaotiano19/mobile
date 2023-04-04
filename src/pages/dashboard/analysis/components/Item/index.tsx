import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
const Item = (props: any) => {

  const textRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 })
  let { chat, setText, handleTextRef, showCursor, text } = props

  useEffect(() => {
    const updateCursor = () => {
      const lastText = getLastTextNode(textRef.current);
      const textNode = document.createTextNode('\u200b');
      if (lastText) {
        lastText.parentElement.appendChild(textNode);
      } else {
        textRef.current?.appendChild(textNode);
      }
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 0);
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect = rects[0];
        const domRect = textRef.current?.getBoundingClientRect();
        if (domRect) {
          setPos({
            x: rect.left - domRect.left,
            y: rect.top - domRect.top,
          });
        }
      }
      textNode.remove();
    };
    updateCursor();
  }, [text]);
  const getLastTextNode = (dom) => {
    const children = dom?.childNodes;
    for (let i = children?.length - 1; i >= 0; i--) {
      const node = children[i];
      if (node.nodeType === Node.TEXT_NODE) {
        // node.nodeValue=node.nodeValule?.replace(/\s+$/,'');
        return node;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const last = getLastTextNode(node);
        if (last) {
          return last;
        }
      }
    }
    return null;
  }

  const handleTextChange = (event: any) => {
    setText(event.target.innerText);
  };

  // 将DOM元素的引用通过props传递给父组件
  if (handleTextRef) {
    handleTextRef(textRef.current);
  }
  ;
  return (
    <li className={chat.role === 'user' ? styles.userChatWrapper : styles.assistantChatWrapper}>
      <div className={styles.divWrapper}>
        <div className={styles.leftDiv}>
          <img className={styles.imgContent} src={chat.role === 'user' ? '/images/01.jpg' : '/images/02.jpeg'} />
        </div>
        <div className={styles.rightDiv} ref={chat.role === 'assistant' ? textRef : null} onChange={chat.role === 'assistant' ? handleTextChange : undefined} >{chat.value}</div>
        {showCursor ? <div className={styles.cursor}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
          }}></div> : null}
      </div>
    </li>
  );
}

export default Item;