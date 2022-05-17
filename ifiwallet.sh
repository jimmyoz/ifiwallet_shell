#!/bin/bash
yum install -y composer
yum install -y composer --skip-broken

yum install -y php-bcmath
yum install -y php-bcmath --skip-broken



setsebool -P httpd_can_network_connect 1