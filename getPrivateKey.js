#!/home/centos/node/bin/node
        var addr="0x631762cc4a68f41fa6c0ad8eefb896c816d8a956";
        var dataDir="/home/centos/infinity/node";
        var keythereum = require('keythereum');
        var fromkey = keythereum.importFromFile(addr, dataDir);
        var privateKey = keythereum.recover('1234567', fromkey);
        console.log(privateKey.toString('hex'));


