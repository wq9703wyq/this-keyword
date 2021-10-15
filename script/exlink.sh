###
 # @Descripttion: 
 # @version: 
 # @Author: 鹿角兔子
 # @Date: 2021-10-15 20:37:00
 # @LastEditors: 鹿角兔子
 # @LastEditTime: 2021-10-15 20:54:09
### 
if [ ! -f "$Link_Json" ]; then
    echo "{}" >> "$Link_Json"
fi
node ./script/extractHyperLink.js