import React from 'react'
import styles from './index.less'
const Item = (props) => {
    let {chat} =props;
    console.log(chat.role);
    return (
        <li className={chat.role==='user'?styles.userChatWrapper:styles.assistantChatWrapper}>
        {chat.value}
        </li>
      );
}
 
export default Item;