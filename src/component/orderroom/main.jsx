import React,{ Component } from "react";
import { observer,inject } from 'mobx-react';
import { WingBlank, WhiteSpace,Card,Modal,SearchBar,Toast} from 'antd-mobile';
import { withRouter } from "react-router-dom";
import { formatViewData, returnRoomPosition } from "../../utils/util";
import Spin from "../layout/spin";
import "./main.css";
import imgstart from "./image/start.png";
import imgfinish from "./image/finish.png";
import imgpro from "./image/process.png";
@inject('appo')
@observer

class Main extends Component{
    componentDidMount(){
        this.props.appo.getAppoInfoByParam();
    }
    deleteOrder = async appoIdarr=>{
        let res = await this.props.appo.deleteAppo(appoIdarr);
        res === 'ok' ? Toast.success('删除成功！', 1) : Toast.fail('删除失败，请重试', 1);
    }
    onChange = value =>{
        this.props.appo.getAppoInfoByParam(value);
    }
    viewOverdata(date, time, endtime,enddate) {
        let s_timearr = time[0].split(':');
        let e_timearr = this.renderCountEndTime(endtime[endtime.length - 1]).split(':');
        let d = Date.parse(new Date(date));
        let endd = Date.parse(new Date(enddate));
        let s_t = d + (Number(s_timearr[0]) - 8) * 60 * 60 * 1000 + (Number(s_timearr[1])) * 60 * 1000;
        let e_t = endd + (Number(e_timearr[0]) - 8) * 60 * 60 * 1000 + (Number(e_timearr[1])) * 60 * 1000;
        if (Date.parse(new Date()) < s_t) {
            return (
                <span style={{color:'blue'}}>
                    待开始
                </span>
            )
        } else if (Date.parse(new Date()) > s_t && Date.parse(new Date()) < e_t) {
            return (
                <span style={{ color: 'green' }}>
                    会议历程中
                </span>
            )
        } else {
            return '已过期';
        }
    }
    /**
     * 渲染会议时间
     * @param {*} time 
     */ 
    renderCountEndTime(time){
        let timearr = time.split(':');
        let endtime = timearr[1] === '00'
            ? timearr[0] + ':30'
            : timearr[1] === '30'
                ? (Number(timearr[0]) + 1) + ':00'
                : '';
        return endtime;
    }
    /**
     *
     * 计算当日会议进行状态
     * @memberof Main
     */
    dayTimeOver = (date,starttime,endtime)=>{
        let s_timearr = starttime.split(':');
        let e_timearr = this.renderCountEndTime(endtime).split(':');
        let d = Date.parse(new Date(date));
        let s_t = d + (Number(s_timearr[0]) - 8) * 60 * 60 * 1000 + (Number(s_timearr[1])) * 60 * 1000;
        let e_t = d + (Number(e_timearr[0]) - 8) * 60 * 60 * 1000 + (Number(e_timearr[1])) * 60 * 1000;
        if (Date.parse(new Date()) < s_t){
            return (
                <img src={imgstart} />
            )
        } else if (Date.parse(new Date()) > s_t && Date.parse(new Date()) < e_t) {
            return (
                <img src={imgpro} />
            )
        } else {
            return (
                <img src={imgfinish} />
            )
        }
    }
    renderData(list) {
        let data = [];
        let newdata=[];
        const alert = Modal.alert;
        for (let i = 0; i < list.length; i++) {
            if (!data[list[i].createTime]) {
                let arr = [];
                arr.push(list[i]);
                data[list[i].createTime] = arr;
            } else {
                data[list[i].createTime].push(list[i]);
            };
        };
        for(let val in data){
            newdata.push(data[val]);
        }
        const listCard = newdata.map(item => {
            let appoIdarr = [];
            const Ctime = item.map(param=>{
                appoIdarr.push(param.appoId)
                return(
                    <p key={param._id}>
                        <span style={{ paddingRight: 10 }}> {param.date}</span>
                        <span style={{ width: 100,display:'inline-block' }}>
                            {param.appoTime[0]}-{this.renderCountEndTime(param.appoTime[param.appoTime.length - 1])} 
                        </span>
                        <span className="countstatusicon">{this.dayTimeOver(param.date, param.appoTime[0], param.appoTime[param.appoTime.length - 1])}</span>
                    </p>
                )
            })
            return(
                   <div key={item[0]._id}>
                    <WingBlank size="lg">
                    <WhiteSpace />
                        <Card>
                            <Card.Header
                                title={item[0].title}
                                extra={<span style={{ fontSize: 12 }}>{this.viewOverdata(item[item.length - 1].date, item[0].appoTime, item[item.length - 1].appoTime, item[0].date)}</span>}
                            />
                            <Card.Body>
                                <div><span>会议地址：</span>{returnRoomPosition(item[0].roomId)}</div>
                                <div className="ctime">
                                    <div>
                                        会议时间：
                                    </div>
                                     <div>
                                        {Ctime}
                                    </div>
                                </div>
                                <WhiteSpace />
                                <div><span style={{fontSize:13,color:'#666'}}>预约时间：{formatViewData('createTime',item[0].createTime)}</span></div>
                            </Card.Body>
                            <Card.Footer content="" extra={<div
                                onClick = {() =>
                                    alert('删除后需要重新预约，确定删除吗？', '', [{
                                            text: '取消',
                                            onPress: () => {}
                                        },
                                        {
                                            text: '确定',
                                            onPress: () => {
                                                this.deleteOrder(appoIdarr)
                                            }
                                        },
                                    ])
                                }>
                                删除
                            </div>} />
                        </Card>
                        <WhiteSpace />
                    </WingBlank>
                    </div> 
                )

        })
        return listCard;

    }
    render(){
        const store = this.props.appo;
        return(
            <div className="orderroom_main">
               
                <div style={{
                    zIndex: 999,
                    position: 'sticky',
                    top: 0,
                    background: '#efeff4'
                }}>
                    <WingBlank>
                        <SearchBar onChange={this.onChange} placeholder="输入会议主题搜索" />
                    </WingBlank>
                </div>
              
                <div className="title">
                    <h4>--我的预约--</h4>
                </div>
                <div className="roomContent">
                    <Spin isLoading={store.isShowLoading}>
                        {store.myorderInfo.length !== 0 ? this.renderData(store.myorderInfo) : (
                            <div className="empty_order">
                                空空如也~
                            </div>
                        ) }
                    </Spin>
                </div>
            </div>
        )
    }
}
export default withRouter(Main);