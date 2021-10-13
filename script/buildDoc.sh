###
# @Descripttion:
# @version:
# @Author: 鹿角兔子
# @Date: 2021-10-12 19:31:16
 # @LastEditors: 鹿角兔子
 # @LastEditTime: 2021-10-13 23:52:38
###
if [ ! -f "$Link_Json" ]; then
    echo "link.json has not been generated"
    exit 0
fi
# cat $Original_Doc > $Dist_Doc
echo "new" > $Dist_Doc
node ./script/build.js
# cat link.yml | tr -d "\"" | xargs echo >> README.md
