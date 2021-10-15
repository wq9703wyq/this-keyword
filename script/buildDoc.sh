###
# @Descripttion:
# @version:
# @Author: 鹿角兔子
# @Date: 2021-10-12 19:31:16
 # @LastEditors: 鹿角兔子
 # @LastEditTime: 2021-10-15 21:31:37
###
if [ ! -f "$Link_Json" ]; then
    echo "link.json has not been generated"
    exit 0
fi
cat $Original_Doc > $Dist_Doc
node ./script/build.js
