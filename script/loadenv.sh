###
 # @Descripttion: 
 # @version: 
 # @Author: 鹿角兔子
 # @Date: 2021-10-12 20:29:37
 # @LastEditors: 鹿角兔子
 # @LastEditTime: 2021-10-12 20:44:02
### 
set -eo pipefail
ENV=$(grep -v "^#" .env | xargs)
export $ENV
