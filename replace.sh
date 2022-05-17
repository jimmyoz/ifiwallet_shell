#!/bin/bash
server=""
port=""
nodeIP=""
confirm=No
temp=""

while [ "$confirm" != "YES" ]   
do
read -p "请输入服务器(ifiwallet/web)ip:" server
temp=$(eval echo $server)
server=$temp
echo "你输入的服务器ip为:"$server
read -p "服务器ip是否正确，是否想重新输入(yes(大小写均可)或其他):" temp
confirm=$(echo $temp | tr '[a-z]' '[A-Z]')
done
echo $server

confirm=No
while [ "$confirm" != "YES" ]  
do
read -p "请输入服务器(ifiwallet/web)端口号:" port
temp=$(eval echo $port)
port=$temp
echo "你输入的服务器端口号为:"$port
read -p "服务器端口号是否正确，是否想重新输入(yes(大小写均可)或其他):" temp
confirm=$(echo $temp | tr '[a-z]' '[A-Z]')
done
echo $port

confirm=No
while [ "$confirm" != "YES" ] 
do
read -p "请输入主节点ip:" nodeIP
temp=$(eval echo $nodeIP)
nodeIP=$temp
echo "你输入的主节ip为:"$nodeIP
read -p "主节点ip是否正确，是否想重新输入(yes(大小写均可)或其他):" temp
confirm=$(echo $temp | tr '[a-z]' '[A-Z]')
done
echo $nodeIP

reg1=$(printf 's/112.35.192.13:8081/%s:%s/g' "$server" "$port")
reg2=$(printf 's/112.35.192.13:7000/%s:7000/g' "$server")
reg3=$(printf 's/112.35.181.215:8545/%s:8545/g' "$nodeIP")

sed -i $reg1 ./exp2/js/*.js
sed -i $reg2 ./exp2/js/*.js
sed -i $reg3 ./exp2/js/*.js