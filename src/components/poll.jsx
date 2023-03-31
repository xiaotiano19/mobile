// import {queryHistory} from "@/service/manager";
const { queryHistory } = require('@/service/manager');

class WebWorker {
  constructor(worker) {
    let code = worker.toString();
    code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

    const blob = new Blob([code], { type: 'text/javascript' });
    // worker地址为同源地址
    return new Worker(URL.createObjectURL(blob));
  }
}

export const workers = () => {
  //
  function workerCode() {
    this.onmessage = (e) => {
      const {
        data: { taskId, url },
      } = e;
      setInterval(() => {
        // this.postMessage(taskId)
        //创建对象
        const timestamp = new Date().valueOf();
        const params = {
          createdStartTimestamp: timestamp - 2000,
          createdEndTimestamp: timestamp,
          taskId,
        };
        const str = JSON.stringify(params);
        const xhr = new XMLHttpRequest();
        //初始化，设置请求方法和url
        // xhr.open('POST', 'http://localhost:8000/api/hh/hh');
        xhr.open('POST', `${url}/api/hh/hh`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        //发送
        xhr.send(str);
        xhr.onreadystatechange = () => {
          //判断（服务端返回了所有的结果）
          if (xhr.readyState === 4) {
            //判断响应的状态码200 404 401 500
            //2xx 成功
            if (xhr.status >= 200 && xhr.status < 300) {
              //处理结果 行 头 空行 体
              xhr.status; //状态码
              xhr.statusText; //状态字符串
              xhr.getAllResponseHeaders(); //所有的响应头
              xhr.response; //响应体
              //将返回的结果给到主线程
              this.postMessage(JSON.parse(xhr.response));
            }
          }
        };
      }, 2000);
      // this.postMessage(e);
    };
    // this.postMessage({});
  }
  const myWorker = new WebWorker(workerCode);
  return myWorker;
};