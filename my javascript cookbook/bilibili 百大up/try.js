let all = [];
$(".name").each((index, element) => {
    all.push(element.innerHTML);
});


let tabs = $('.tid-tabs .blue');
// i 从 1 到 tabs.length-1
let i = 1;
// 字典用来存储  分区: 对应分区百大up主
let area = {};


let getData = async (i, timer) => {
    try {
        tabs[i].click();
        setTimeout(function () {
            console.warn("开始获取该分区up主id...");
            area[tabs[i].innerHTML] = [];
            $('.name').each((index, element) => {
                area[tabs[i].innerHTML].push(element.innerHTML);
            });
            if (i === tabs.length - 1) {
                clearInterval(timer);
                console.log("%c恭喜你，%c全部获取完成！", "color:green", "font-weight:bold");
                console.log("全站百大up：", all);
                console.log("分区百大up：", area);
            } else {
                console.log("%c恭喜你，%c该分区获取完毕！", "color:green", "font-weight:bold");
                console.warn("准备跳转至下一分区...")
            }
        }, 1500)
    } catch (error) {
        throw error
    }
};

let timer = setInterval(function () {
    getData(i, timer);
    console.log(`当前分区是 %c ${tabs[i].innerHTML}`, "color:blue");
    i++;
}, 2000);


