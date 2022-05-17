#!/usr/local/node/bin/node
var conf=getConfig('/home/js/Config.ini');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://54.252.195.103:8545"));
var mysql= require('mysql');
var sd = require('silly-datetime');
var connection=null;
/* connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Ehangnet2005@',
  database : 'ette'
});
connection.connect();*/
connectMysql();
var startTime= Date.now();
var interval=8;
var nearTime=200;
var perInterval=20;
if(conf)
{
if(conf.interval) interval=conf.interval;
if(conf.nearTime) nearTime=conf.nearTime;
if(conf.perInterval) perInterval=conf.perInterval;
}
setInterval(checkAndConfirm,1000*interval,startTime); 
function checkAndConfirm(){
connection.query(" select tx_hash,node_address  from ifi_award_log where status=0 and UNIX_TIMESTAMP(now())-timestamp<"+nearTime+" order by timestamp desc", function (error1, rs1, fields) {
  if(error1) 
  {
    log(error1);
    return;
	
  }
  if(!rs1) 
  {
	  log("no unConfirmed ifi_award_log in latest "+nearTime+" seconds!");
	  return;
  }
  if(!rs1[0]) 
  {
	  log("no unConfirmed ifi_award_log in latest "+nearTime+" seconds!");
	  return;
  }
  let i=0;
    while(rs1[i]){
	  let address=rs1[i].node_address;
	  let tx_hash=rs1[i].tx_hash;
	  i++;
	  log("address: "+address);
	  log("tx_hash: "+tx_hash);
	let hd=setTimeout(function(){
		 web3.eth.getTransactionReceipt(tx_hash, function(error2, rs2){
		if(error2)
		{
			log(error2);
			clearTimeout(hd);
			return;
		}

	   if(!rs2) 
	   {   
           log(tx_hash+": receipt is empty");
		   clearTimeout(hd);
		   return;
	   }
	   if(!rs2["status"])
	   {
		   log(rs2);
		   clearTimeout(hd);
		   return;
	   }
           
		  let conctract_address="0x84fc41Ee42872c7eE511025dCbC00E32cdA6b079";	  
		  let to=conctract_address.substr(2);
		  let address1=address.substr(2);
		  let funcSelector = "0x70a08231";
          let data = funcSelector+"000000000000000000000000"+address1;
		  web3.eth.call({to: to, data: data},function(eror3,rs3){
		  let balance=parseInt(rs3,16);
		  log("tx_hash: "+tx_hash);
		  log("balance: "+balance);
		  connection.query(" update ifi_award_log set status=1,ifi_balance="+balance+" where tx_hash='"+tx_hash+"'", function (error4, rs4, fields) {	 
		  if(error4)
		  {
			  log(error4);
		  }
		  });
        });
	   });
		clearTimeout(hd); 
	 },perInterval);     
}

log("has listen all,wait for callback")
 
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

 function connectMysql() {
  if(connection) connection.end();
connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Ehangnet2005@',
  database : 'ette',
  useConnectionPooling: true
});

    //连接错误，2秒重试
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
