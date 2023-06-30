# Galex 相关脚本

- 包含任务 `claim` 脚本
- 包含破解 `geetest` 脚本
- 包含获取银河 `passport widget url` 脚本 `pnpm task -a passport`
- 包含银河护照NFT `claim` 脚本 `pnpm task -a claimp`
- 后续计划加入更多galex功能脚本
  - 绑定twitter
  - 绑定邮箱
  - 手动触发verify
  - 完成附加任务(无需强制校验任务)
  - 问卷类任务提交
  - 获取奥德赛总积分

## 🤲 拜托

- 🥹 关注本人推特 [@0x3lang](https://twitter.com/0x3lang)，会不定期开源脚本 

> 请自行检查代码，和项目依赖，风险自担，可以自行修改。

## 环境

- Nodejs [lts](https://nodejs.org/en/download), 👉[教程戳这里](https://www.liaoxuefeng.com/wiki/1022910821149312/1023025597810528)

## 安装依赖

```bash
npm install # 安装依赖
```

## 配置变量

调整 `config.ts` 文件的三个配置:

- campaignId: 例如 https://galxe.com/Linea/campaign/GCw91UQDkQ, campaignId就是 `GCw91UQDkQ`

- passportPwd: 银河护照领取需要配置密码，这个要符合银河密码要求，否则会报错

- w: geetest验证参数，运行前记得更新(一天一次即可)，获取方式见下图

### 获取w参数

打开个人设置页面 https://galxe.com/accountSetting?tab=Account
![geetest_1](./public/galex_w_1.png)
![geetest_2](./public/galex_w_2.png)
![geetest_3](./public/galex_w_3.png)

## 运行

`keys.txt` 放私钥，一行一个

```bash
npm run task -a claim 
```

支持并发运行，例如：

```bash
npm run task -a claim -b 10 # 例如100个私钥，分十份并发跑，节省时间，但是会降低容错
```
