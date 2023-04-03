//model: reducer effects subscriptions
export default {
    namespace: "chat",//合并后state的键名 combineReducer左边的键名
    state: {
        chat: {}
    },//state初始值
    reducers: {
        sendMessage(state,action){
            return ({chat:{...state.chat,...action.payload}})
        }
    },
    effects: {//和reducers同级 effects相当于saga
        *sendMessage({ payload }, { put,  select }) {
            let chat = yield select(state => state.chat)
            console.log("chat", chat)
            yield put({ type: "sendMessage" })
        }
    },
}