#!/usr/local/node/bin/node
var Web3 = require('web3');
var mysql = require('mysql');
var web3 = new Web3(new Web3.providers.HttpProvider("http://54.252.195.103:8545"));
var request = require("request");
var fs = require('fs');
var ini = require('ini');
var sd=require('silly-datetime');
var config = ini.parse (fs .readFileSync ("/home/js/Config_s.ini" ,'UTF-8'));
console.log(Web3.version);
var abi = require("./abi.json");
var address = "0x84fc41Ee42872c7eE511025dCbC00E32cdA6b079";
var contract = new web3.eth.Contract(abi,address); //合约实例
var startTime= Date.now();
let fromB=parseInt(config.fromB);
let intervalB=parseInt(config.intervalB);
let interval=parseInt(config.interval);
let toB=fromB+intervalB;
var blockNumber=0;
var needCheckBlockNumber=false;
var hd1=-1;
var insertStr="insert into ifi_transfer_records(blockNumber,transactionIndex,logIndex,contractAddress,`from`,`to`,`value`) values";
var connection=null;
var ifi_account="0x5e4a8b4811b2b41e0d7a672c12ebcd7ead52ff0f";

var util=require('util');

log("fromB: "+fromB);
log("intervalB: "+intervalB);

/*connection = mysql.createConnection({
  host     : '54.95.29.125',
  user     : 'root',
  password : 'Ehangnet2005@',
  database : 'ette',
  useConnectionPooling: true
});
 
connection.connect();*/
connectMysql();

//查询合约名称
/*contract.methods.name().call().then(
        function(result){
            console.log(result);
        }
    );*/
	
var dt1=new Date(sd.format(new Date(),"YYYY-MM-DD")+" 23:59:59");
//setInterval(getAll,24*60*60*1000,dt1);
setInterval(getAll,30*1000,startTime);
web3.eth.getBlockNumber(function(err,result){
	blockNumber=result;
	log("blockNumber:"+blockNumber);
	hd1=setInterval(saveRecords,interval,startTime);
	//saveRecords();
});

//clearInterval(hd1);  



function saveRecords(){
	toB=fromB+intervalB-1;

	
	if(needCheckBlockNumber) 
	{
	web3.eth.getBlockNumber(function(err,result){	
	if(result>blockNumber)
	{
		blockNumber=result;
		needCheckBlockNumber=false;
		log("new blockNumber:"+blockNumber);
	}
    });	    
	return;
	}
	
	if(toB>blockNumber)
	{
	toB=blockNumber;
	needCheckBlockNumber=true;	
	}
	
	log("fromB:"+fromB);
	log("toB:"+toB);
	
	

contract.getPastEvents('Transfer', {
  //  filter: {_from: ifi_account},
    fromBlock: fromB,//733640,
    toBlock: toB//'latest'
}, (err1, events) => {
	if(err1) 
	{
		log(err1);
		//setTimeout(function(){},100);
		return;
	}
    if(!events)	
	{
		return;
	}
let len=events.length;
     log("log count:"+len);
     if(len==0)
	 {
		 return;
	 }
	 let valuesStr="";
for(let i=0;i<len;i++)
{
	//console.log(events[i].returnValues['0']);
	//console.log(events[i].returnValues['1']);
	//console.log(events[i].returnValues['2']);
	//console.log("\r\n");
	//console.log(events[i]);
	//if(events[i].event!="Transfer") continue;
	//let hd2=setTimeout(function(){
		valuesStr=valuesStr+" ("+
		events[i].blockNumber+","+
		events[i].transactionIndex+","+
		events[i].logIndex+",'"+
		events[i].address+"','"+
		events[i].returnValues.from+"','"+
		events[i].returnValues.to+"',"+
		events[i].returnValues.value+
		")";
		if(i<len-1) valuesStr+=",";
	
	//	clearTimeout(hd2);
	//},1);
}
//console.log(insertStr+valuesStr);
connection.query(insertStr+valuesStr,function(err2,result){
	      	if(err2) log(err2);	
		});

 });
fromB=toB+1;
}
 
 
 function connectMysql() {
	 if(connection) connection.end();
connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Ehangnet2005@',
  database : 'ette',
  useConnectionPooling: true
});

    //连接错误，500毫秒重试
    connection.connect(function (err) {
        if (err) {
            log('error when connecting to db:', err);
            setTimeout(connectMysql , 500);
        }
    });

    connection.on('error', function (err) {
        log('db error', err);
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
           connectMysql();
        } else {
            throw err;
        }
    });
}

function log(s)
{
var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
console.log(time+": "+s);
}
function getConfig(path)
{
var fs = require('fs');
var ini = require('ini');
var Info=null;
if(path)
Info= ini.parse (fs .readFileSync (path ,'UTF-8'));
return Info;
}


function getAll(){
	
	var from=ifi_account;// "0x94BFc596DE16E35E339d13AbC9eE39CbFBfFA9b0";
	var balance=0;
	var givenIfI=0;  // 全网账户持币总量
	var totalIFI=2.1E+26;
	var trxCount=0;     //全网可见交易数
	var accountsCount=0; //全网账户总数
	var nodesCount=0;    //接入节点总数量
	var accountsIFI=0;   //持有IFI账户数
	var nodesOnline=0;  //在线设备数量
	var totalScore=0;  //全网总算力
	var nodesNew=0; //每天新增设备数量
	
contract.methods.totalSupply().call().then(function (result){
//console.log('The totalSupply is: '+result);
totalIFI=result;


contract.methods.balanceOf(from).call().then(function (result){
console.log(from+' balance is: '+result);
balance=result;
givenIfI=totalIFI-balance;

connection.query("select count(hash) count from transactions",function(err1,result1){
		 if(err1) 
		 {
			 console.log(err1);
			 return;
		 }
		 trxCount=result1[0].count;
		 
		 connection.query("select count(id) count from nodes",function(err2,result2){
		    if(err2) 
		    {
			    console.log(err2);
			     return;
		    }
		        nodesCount=result2[0].count;
		        accountsCount=nodesCount;

		           connection.query("select count(t.to) count from (select t1.`to`,if(v1 is null,0,v1)-if(v2 is null,0,v2) ifi_balance from (select `to`,sum(`value`) v1 from ifi_transfer_records group by `to` )  t1  left join (select `from`,sum(`value`) v2 from ifi_transfer_records group by `from` ) t2 on t1.`to`=t2.`from` where if(v1 is null,0,v1)-if(v2 is null,0,v2)>0) t",function(err3,result3){
		               if(err3) 
		                {
			             console.log(err3);
			              return;
		                }
		                 accountsIFI=result3[0].count;
						
						 connection.query("select count(id) count from nodes where unix_timestamp(now())-unix_timestamp(last_updated)<=3600",function(err4,result4){
		                       if(err4) 
		                       {
			                     console.log(err4);
			                     return;
		                        }
								nodesOnline=result4[0].count;
							
								connection.query("select sum(if(logicalScore is null,0,logicalScore)) sum from nodes",function(err5,result5){
		                           if(err5) 
		                            {
			                          console.log(err5);
			                          return;
		                            }
									totalScore=result5[0].sum;
	
								    connection.query("select  count(t.owner_address) count from (select owner_address from nodes_startup group by owner_address having owner_address is not null and date(min(startup_time))=date(now())) t",function(err6,result6){
		                                 if(err6) 
		                                 {
			                              console.log(err6);
			                              return;
		                                  }
									      nodesNew=result6[0].count;
										  
										  let dt=sd.format(new Date(),"YYYY-MM-DD");
		                                connection.query("select count(id) count from summaryOfDay where dt='"+dt+"'",function(err7,result7){   
										   if(err7) 
		                                 {
			                              console.log(err7);
			                              return;
		                                  }
										  
										  let n=Number(result7[0].count);
										  
										  if(n>0)
										  {
											   var updateStr1=util.format("update summaryOfDay set trxCount=%d,accountsCount=%d,accountsIFI=%d,nodesCount=%d,nodesOnline=%d,givenIfI=%d,nodesNew=%d,totalScore=%f where dt='%s'",trxCount,accountsCount,accountsIFI,nodesCount,nodesOnline,givenIfI,nodesNew,totalScore,dt);
										   connection.query(updateStr1,function(err8,result8){
		                                         if(err8) 
		                                         {
			                                       console.log(err8);
			                                        return;
		                                         }
											   console.log(result8);
											   return;
										   });
										  }
										  else
										  {
										  var insertStr1=util.format("insert into summaryOfDay(trxCount,accountsCount,accountsIFI,nodesCount,nodesOnline,givenIfI,nodesNew,totalScore,dt) values(%d,%d,%d,%d,%d,%f,%d,%f,'%s')",trxCount,accountsCount,accountsIFI,nodesCount,nodesOnline,givenIfI,nodesNew,totalScore,dt);
										   connection.query(insertStr1,function(err9,result9){
		                                         if(err9) 
		                                         {
			                                       console.log(err9);
			                                        return;
		                                         }
											   console.log(result9);
											   return;
										   });
										  }
										});
										  
									});	  
									
								});
								
			               });
		 		 
		          });
		 
		});
});


});

});	
}
