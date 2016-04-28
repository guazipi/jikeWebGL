/**
 * Created by Administrator on 2016/4/27.
 */
window.onload = function () {
    imgLocation("container", "box");
    var imgData = {"data": [
        {"src": "2.jpg"},
        {"src": "3.jpg"},
        {"src": "4.jpg"},
        {"src": "5.jpg"},
        {"src": "6.jpg"},
        {"src": "7.jpg"},
        {"src": "8.jpg"},
        {"src": "9.jpg"},
    ]};
    window.onscroll = function () {
        if (checkFlag("container", "box")) {
            var cparent = document.getElementById("container");
            for(var i=0;i<imgData.data.length;i++){
                var ccontent=document.createElement("div");
                ccontent.className="box";
                cparent.appendChild(ccontent);
                var boximg=document.createElement("div");
                boximg.className="box_img";
                ccontent.appendChild(boximg);
                var img=document.createElement("img");
                img.src="./images/"+imgData.data[i].src;
                boximg.appendChild(img);
            }
            imgLocation("container", "box");
        }
    }
}

function checkFlag(parent, content) {
    var cparent = document.getElementById(parent);
    var ccontent = getChildElement(cparent, content);
    var lastContentHeight = ccontent[ccontent.length - 1].offsetTop;

    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var pageHeight = document.documentElement.clientHeight || document.body.clientHeight;
    //console.log(lastContentHeight+" "+scrollTop+" "+pageHeight);
    if (lastContentHeight < scrollTop + pageHeight) {
        return true;
    }

}
function imgLocation(parent, content) {
    var cparent = document.getElementById(parent);
    var ccontent = getChildElement(cparent, content);
    var imgWidth = ccontent[0].offsetWidth;
    var cols = Math.floor(document.documentElement.clientWidth / imgWidth);
    cparent.style.cssText = "width:" + imgWidth * cols + "px;margin:0 auto;";

    var boxHeightArr = [];
    for (var i = 0; i < ccontent.length; i++) {
        if (i < cols) {
            boxHeightArr.push(ccontent[i].offsetHeight);
            //console.log(ccontent[i].offsetHeight);
        } else {
            var minheight = Math.min.apply(null, boxHeightArr);
            //等价于Math.min(boxHeightArr[0],boxHeightArr[1],boxHeightArr[2]...)
            var a=Math.min(1,2,3,4);
            var minIndex = getminheightLocation(boxHeightArr, minheight);

            ccontent[i].style.position = 'absolute';
            ccontent[i].style.top = minheight + "px";
            ccontent[i].style.left = ccontent[minIndex].offsetLeft + "px";

            boxHeightArr[minIndex] = boxHeightArr[minIndex] + ccontent[i].offsetHeight;
        }
    }
}

function getminheightLocation(boxHeightArr, minHeight) {
    for (var i in boxHeightArr) {
        if (boxHeightArr[i] == minHeight) {
            return i;
        }
    }
}
function getChildElement(parent, content) {
    var contentArr = [];
    var allcontent = parent.getElementsByTagName("*");
    for (var i = 0, length = allcontent.length; i < length; i++) {
        if (allcontent[i].className == content) {
            contentArr.push(allcontent[i]);
        }
    }
    return contentArr;
}