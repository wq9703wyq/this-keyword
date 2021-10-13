/*
 * @Descripttion: 
 * @version: 
 * @Author: 鹿角兔子
 * @Date: 2021-10-13 13:33:01
 * @LastEditors: 鹿角兔子
 * @LastEditTime: 2021-10-13 23:55:45
 */
const fs = require("fs");
const { Original_Doc, Link_Json } = process.env;
// 判断超链接文件是否存在
fs.stat(Link_Json, (err, stats) => {
    if (!stats) {
        fs.writeFileSync(Link_Json, "");
    }
    // 读取超链接文件
    const hyperLink = JSON.parse(fs.readFileSync(Link_Json, {encoding: "utf8"})) || {};
    // 读取文档
    const doc = fs.readFileSync(Original_Doc, { encoding: "utf8" });
    const linkRegex = /\[+[\u4e00-\u9fa5_a-zA-Z0-9- ]+\]+(?=\(\))/g
    const docLink = [...new Set(doc.match(linkRegex))].map(item => [item, ""]);
    const mergeLink = { ...Object.fromEntries(docLink), ...hyperLink};
    fs.writeFileSync(Link_Json, JSON.stringify(mergeLink), {encoding: "utf8"});
})