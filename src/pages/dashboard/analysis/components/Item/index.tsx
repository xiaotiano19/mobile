import React from 'react'
import styles from './index.less'
const Item = (props) => {
    let {chat} =props;
    return (
        <li className={chat.role==='user'?styles.userChatWrapper:styles.assistantChatWrapper}>
          <div className={styles.divWrapper}>
            <div className={styles.leftDiv}>
              <img style={{width:'32.5px',height:'32.5px'}} src={chat.role==='user'?'/images/01.jpg':'/images/02.jpeg'} />
            </div>
            <div className={styles.rightDiv}>{chat.value}</div>
          </div>
        </li>
      );
}
 
export default Item;