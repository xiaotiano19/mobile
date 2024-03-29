import React, { useState,useRef, useEffect } from 'react'
import { Divider, Input, Layout,Space ,Form} from 'antd'
import {connect} from 'umi'
import styles from './style.less'
import Item from './components/Item'
const { Header, Footer, Content } = Layout
const { TextArea } = Input

const headerStyle = {
    textAlign: 'center',
    color: 'black',
    height: 64,
    paddingInline: 50,
    lineHeight: '64px',
    fontSize: '32pt',
    backgroundColor: 'white',
}

const contentStyle= {
    margin: '10px',
    textAlign: 'center',
    minHeight: 200,
    lineHeight: '32px',
    backgroundColor: 'white',
}


const footerStyle= {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'white',
}


const App = (props) => {

 const [chatList, setchatList] = useState([])//存储用户以及客服的聊天
 const [chatTitle, setchatTitle] = useState('')//每个聊天窗口的标题
 const [isDisabled, setisDisabled] = useState(false)
 const textAreaRef = useRef(null);
 const [text, setText] = useState('');//回复文本
 const [textRef, setTextRef] = useState(null);//显示回复文本的dom对象
 const [showCursor, setshowCursor] = useState(true)


    // useEffect(() => {
    //     if (textRef) {
    //       const textElement = textRef;
    //       const cursorElement =cursorRef;
    //       const textWidth = textElement.offsetWidth;
    //       const textHeight = textElement.offsetHeight;
    //       const cursorWidth = cursorElement.offsetWidth;
    //       const cursorHeight = cursorElement.offsetHeight;
    //       const cursorX = textWidth + cursorWidth / 2;
    //       const cursorY = textHeight + cursorHeight / 2;
    //     }
    //   }, [text]);
    const handleTextRef = (ref) => {
        setTextRef(ref);
    };

    const handleKeyDown = (e) => {
      if (e.keyCode === 13 && !e.shiftKey) { // 判断按下的是否为回车键
        e.preventDefault(); // 阻止默认的回车键行为
        e.stopPropagation(); // 阻止事件冒泡
        form.submit();
        onSubmit();
      }
    };
    const onSubmit=async()=>{
      setisDisabled(true);
      const res = await fetch(
        'http://192.168.2.135:44444/stream',
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(
                {
                    model: "gpt-3.5-turbo",
                    stream: true
                }
            ),
        });
        if (res.status !== 200) {
          const statusText = res.statusText;
          throw new Error(statusText);
      }

      const decoder = new TextDecoder();
      const reader = res.body.getReader();

      try {
          let curMsg = '';
          while (true) {
              const { done, value } = await reader.read();
              if (done) {
                  break;
              }
              const delta = JSON.parse(decoder.decode(value))
              curMsg += delta
              const resMsg = {
                  role: 'assistant',
                  value: curMsg
              }
              setchatList([...chatList, resMsg])
              const title=chatList[0].value;
              setchatTitle(title);
          }
      } catch (error) {
          console.error('Error reading stream:', error);
      } finally {
          reader.releaseLock();
          setshowCursor(false);
          setisDisabled(false);
      }
      
    }
    const onFinish = (values) => {
      localStorage.setItem('chatv',JSON.stringify(values))//存储用户输入的问题
      form.resetFields(); // 提交表单后清空表单中的所有字段的值
      textAreaRef.current.focus();
      addChat()
    };
    const addChat=()=>{
      let chat={};
      let chatv=JSON.parse(localStorage.getItem('chatv'))
      chat.role='user';
      chat.value=chatv.textArea;
      chatList.push(chat);
      setchatList([...chatList])
    }


    const [form] = Form.useForm();
    return (
        <Space direction="vertical" style={{ width: '100%' }} size={[0, 48]}>
            <Layout style={{ backgroundColor: "white" }}>
                <Header style={headerStyle}>ChatGPT Playground</Header>
                <Divider style={{ margin: '10px' }} />
                <Content style={contentStyle}>
                  {
                  chatList?.map((chat,index)=>{
                      return <Item key={index} chat={chat} setText={setText} 
                      text={text}
                      handleTextRef={handleTextRef} 
                      showCursor={showCursor}/> 
                  })
                  }
                </Content>
                <Divider style={{ margin: '10px' }}  />

                <Footer style={footerStyle}  >
                 
                    <Form onFinish={onFinish} form={form} >
                      <Form.Item name="textArea" > 
                         <div className={styles.searchContainer}>
                         <TextArea  className={styles.searchTextarea}
                                    placeholder="Search..."
                                    autoSize={{ minRows: 1, maxRows: 5 }}
                                    onKeyDown={handleKeyDown}
                                    ref={textAreaRef}
                                    disabled={isDisabled} />
                         </div>
                        </Form.Item>
                      </Form>
                </Footer>
            </Layout>
        </Space>
    )
}

export default App;