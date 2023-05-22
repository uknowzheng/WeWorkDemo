## 企业微信客户端项目

### 配置相关
- 具体配置的文件路径在src/config/index.js中，主要涉及本地开发代理的服务器地址以及ws的地址，根据自己需要选择项目basepath
- 另外一个配置文件主要为vue.config.js,主要本地开发时候构建使用，一般情况只需要修改src/config/index.js即可

## 本地开发
先运行命令：
```
npm install
npm run serve
```
完事后访问localhost:8000即可

## 具体部署说明
```
npm run prod
```
- 根据上述构建后，会出构建产物./dist.zip于当前项目下。
- 然后将产物放到服务器unzip之后，执行以下./start.sh即可（此处需要nodejs环境，建议nodejs16版本）
- 完事后代码会运行在localhost:3000之上，直接访问http://localhost:3000

## 结合实际场景
结合实际需要部署个nginx，nginx配置如下：
- pass / 到localhost:3000(前端静态服务器)
- pass /banana 到localhost:8008(后端服务器)
然后完事，本地访问http://localhost/即可



