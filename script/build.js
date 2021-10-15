/*
 * @Descripttion: 
 * @version: 
 * @Author: 鹿角兔子
 * @Date: 2021-10-12 19:10:20
 * @LastEditors: 鹿角兔子
 * @LastEditTime: 2021-10-15 21:31:43
 */
const { Dist_Doc, Link_Json } = process.env;
const fs = require("fs");
const doc = fs.readFileSync(Dist_Doc, { encoding: "utf8" });
const link = JSON.parse(fs.readFileSync(Link_Json, { encoding: "utf8" }));
const linkMd = Object.entries(link).map(([key, value]) => {
    const _key = key.replace(/(\[{2,})([\u4e00-\u9fa5_a-zA-Z0-9\s-]+)(\]{2,})/g, (match, p1, p2, p3) => {
        return `${p1.replace(/(?<=\[)\[/g, "\\[")}${p2}${p3.replace(/\](?=\])/g, "\\]")}`
    })
    return `${_key}: ${value}`
})

const newDoc = doc.replace(/(\[+)([\u4e00-\u9fa5_a-zA-Z0-9\s-]+)(\]+)\(\)/g, (match, p1, p2, p3) => {
    return `${p1.replace(/(?<=\[)\[/g, "\\[")}${p2}${p3.replace(/\](?=\])/g, "\\]")}`
})

fs.writeFileSync(Dist_Doc, `${newDoc}\r${linkMd.join("\r")}`, { encoding: "utf8" });