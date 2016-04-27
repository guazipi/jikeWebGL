/**
 * Created by Administrator on 2016/4/27.
 */
window.onload = function () {
    imgLocation("container", "box");
}
function imgLocation(parent, content) {
    var cparent = document.getElementById(parent);
    var ccontent = getChildElement(cparent, content);
    console.log(ccontent);
    var imgWidth=content[0].offsetWidth;
    var cols=Math.floor(document.documentElement.clientWidth/imgWidth);

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