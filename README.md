### 招新系统前端
[![Build Status](https://git.wutnews.net/gwc0721/joinus-frontend/badges/master/build.svg)](https://git.wutnews.net/gwc0721/joinus-frontend/builds)
[![Build Status](https://ci.wutnews.net/gwc0721/joinus-frontend.svg?token=YE8JszxHLNbshJmMo8ws&branch=master)](https://ci.wutnews.net/gwc0721/joinus-frontend)

#### 环境
* Node.js
* Bower
* Gulp

首次参与项目开发，请先安装 Node 环境，并在项目目录下执行以下命令:
```bash
npm install -g bower
npm install -g gulp
npm install
bower install
```

#### 更新 Node 组件
```sh
npm update
```

#### 更新 bower 组件
```sh
bower update
```

#### 安装 Node 组件
以 gulp 为例:
```sh
npm install --save gulp
```
或
```sh
npm install --save-dev gulp
```

#### 安装 bower 组件
以 jQuery 为例:
```sh
bower install jquery --save
```
或
```sh
bower install jquery --save-dev
```

Bower 默认安装最新版，如需安装指定版本则需要在组件名称后加上 `#版本号`  
例如安装 jQuery 1.x.x:
```sh
bower install jquery#1 --save
```
