<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/4/26
 * Time: 11:32
 */
ob_implicit_flush();

header('Content-Type:text/event-stream');

for($i=0;$i<100;$i++){
    date_default_timezone_set("Asia/Shanghai");
    echo 'data:'.date('Y-m-d H-i-s');
    echo "\n\n";
    ob_flush();
    flush();
    sleep(1);
}