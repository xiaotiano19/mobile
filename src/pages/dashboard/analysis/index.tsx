import React, { useState } from 'react'
import type { RadioChangeEvent } from 'antd'
import { Button, Col, Divider, Input, Layout, message, Popconfirm, Radio, Row, Space } from 'antd'

const { Header, Footer, Content } = Layout
const { TextArea } = Input

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'black',
    height: 64,
    paddingInline: 50,
    lineHeight: '64px',
    fontSize: '32pt',
    backgroundColor: 'white',
}

const contentStyle: React.CSSProperties = {
    margin: '10px',
    textAlign: 'center',
    minHeight: 200,
    lineHeight: '32px',
    backgroundColor: 'white',
}


const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'white',
}


const App: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [arr, setArr] = useState([{
        role: 'user',
        content: ''
    }])
    const [sysMsg, setSysMsg] = useState({ role: 'system', content: '' })
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)
    const [downloadLoading, setDownloadLoading] = useState<boolean>(false)
    const [tempValue, setTempValue] = useState<number>(0.7)
    const [maxLenValue, setMaxLenValue] = useState<number>(256)

    const newMessage = (index: number) => {
        // console.log('new message', index)
        arr.splice(index + 1, 0, { role: 'user', content: '' })
        setArr([...arr])
    }

    const delMessage = (index: number) => {
        // console.log('delete message', index)
        if (arr.length > 1) {
            arr.splice(index, 1,)
            setArr([...arr])
        } else {
            messageApi.open({
                type: 'warning',
                content: '这是最后一条了！',
            });
        }
    }

    const onSubmit = async () => {
        console.log("submit", [sysMsg, ...arr])
        let flag = false
        let index = 0
        for (let item of arr) {
            index++
            if (item.content === "") {
                messageApi.open({
                    type: 'warning',
                    content: `第${index}行为空，请手动删除后提交！`,
                });
                flag = true
                break
            }
        }

        if (!flag) {
            setSubmitLoading(true)
            const res = await fetch(
                // 'http://127.0.0.1:5001/stream',
                'http://192.168.2.135:44444/stream',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(
                        {
                            model: "gpt-3.5-turbo",
                            messages: [sysMsg, ...arr],
                            stream: true
                        }
                    ),
                });

            if (res.status !== 200) {
                const statusText = res.statusText;
                throw new Error(statusText);
            }

            const decoder = new TextDecoder();
            const reader = res.body?.getReader();

            try {
                let curMsg = '';
                console.log('>> stream start');
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log('<< stream end');
                        break;
                    }
                    // console.log(decoder.decode(value));
                    const delta = JSON.parse(decoder.decode(value))
                    curMsg += delta
                    console.log(delta);
                    console.log(curMsg);


                    const resMsg = {
                        role: 'assistant',
                        content: curMsg
                    }
                    setArr([...arr, resMsg])
                  

                }
            } catch (error) {
                console.error('Error reading stream:', error);
            } finally {
                reader.releaseLock();
                setSubmitLoading(false)
            }
        }
    }

    const onDownload = () => {
        console.log("download data")
        const blob = new Blob([JSON.stringify([sysMsg, ...arr])])
        const downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob)
        downloadElement.href = href
        downloadElement.download = `chatgpt_playground_export_${new Date().toISOString().slice(0, 19)}.json`
        document.body.appendChild(downloadElement)
        downloadElement.click()
        document.body.removeChild(downloadElement)
        window.URL.revokeObjectURL(href)
    }

    const roleOptions = [
        { label: '顾客', value: 'user' },
        { label: '客服', value: 'assistant' },
    ]

    const roleChange = (index, { target: { value } }: RadioChangeEvent) => {
        arr[index].role = value
        setArr([...arr])
    }

    const inputChange = (index, { target: { value } }) => {
        arr[index].content = value
        setArr([...arr])
    }

    const inputTextChange = ({ target: { value } }) => {
        setSysMsg({
            role: sysMsg.role,
            content: value
        })
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size={[0, 48]}>
            {contextHolder}
            <Layout style={{ backgroundColor: "white" }}>
                <Header style={headerStyle}>ChatGPT Playground</Header>
                <Divider style={{ margin: '10px' }} />
                <Content style={contentStyle}>
                    <Row>
                        <Col span={8} style={{ padding: '20px' }}>
                            <TextArea autoSize={{ minRows: 20, maxRows: 40 }} value={sysMsg.content}
                                onChange={inputTextChange} allowClear />
                        </Col>
                        <Col span={16} style={{ padding: '20px' }}>
                            {arr.map((item, index) => (
                                <Input.Group key={index} style={{ margin: '10px' }}>
                                    <Radio.Group options={roleOptions} onChange={roleChange.bind(this, index)}
                                        value={item.role} optionType="button" buttonStyle="solid" />
                                    <TextArea style={{
                                        width: 'calc(100% - 300px)',
                                        margin: '0 20px',
                                        backgroundColor: 'white',
                                        textAlign: 'left'
                                    }}
                                        autoSize={{ minRows: 1, maxRows: 10 }}
                                        value={item.content} onChange={inputChange.bind(this, index)} />
                                    <Button style={{ backgroundColor: 'white' }}
                                        onClick={newMessage.bind(this, index)}
                                    >新建</Button>
                                    <Popconfirm
                                        title="删除提醒"
                                        description="你确定删除吗？"
                                        onConfirm={delMessage.bind(this, index)}
                                    >
                                        <Button style={{ marginLeft: '10px' }} type='primary' danger>删除</Button>
                                    </Popconfirm>
                                </Input.Group>
                            ))}
                        </Col>
                    </Row>
                </Content>
                <Divider style={{ margin: '10px' }} />
                <Footer style={footerStyle}>
                    <Button type="primary" onClick={onSubmit} loading={submitLoading} disabled={submitLoading}>提交</Button>
                    <Button type="dashed" style={{ marginLeft: '40px' }} onClick={onDownload}
                        loading={downloadLoading}>下载</Button>
                </Footer>
            </Layout>
        </Space>
    )
}

export default App