# 钱包 wallet

## 钱包模块

### 新增支付链相关接口 pmchain

# 新的模块 payMent

## 配置模块(数值配置、授权 token 相关) config

### 配置

-   payMent 模块至少包含以下配置
    -   ## 业务配置
    -   ## 系统配置

### 授权

-   以往的用户 token 是用户在客户端输入用户名密码，到服务端数据库查询匹配后，将 user 等相关信息放入 token 中，返回至客户端。后续客户端使用 token 来判断身份
-   由于本系统没有用户概念，所以授权方案为客户端自己有方式生成一个公私钥对，在没有 token 的情况下，将公钥发往服务端，服务端在数据库查询该公钥，该公钥随机生成一个校验码返回前端，前端使用私钥将其签名，并把校验码、签名发往服务端。服务单根据校验码对签名进行验证，成功后，将相关信息放入 token 中返回至客户端。

#### 数据表

-   授权表，
    -   至少包含以下字段
    -   公钥
    -   校验码
    -   失效时间
    -   授权地址(数组或字符串)

#### 接口

-   获取校验码
    -   path: GET verifyCode
    -   function: getVerifyCode
    -   传入参数
        -   publicKey: string
    -   传出参数
        -   verifyCode: string
    -   逻辑实现:
        1. 新增校验码函数(随机生成,没有特别要求)，建议 6~8 位 数字+英文组成
        2. 接口调用时使用 publicKey 向数据库查询，若没有 pk 记录，则调用 2 函数后直接新增一条，失效时间暂时写死 30 分钟，返回 verifyCode。若有 pk 记录，且没有过期则直接返回 verifyCode，若过期则重新生成 verifyCode 并更新数据库的校验码及延长失效时间。
-   获取 token (授权)
    -   path: POST token
    -   function: getToken
    -   传入参数
        -   signature: string
        -   publicKey: string
        -   address: string[] 授权地址
        -   deviceId: string 设备 id
    -   传出参数
        -   token: string
    -   逻辑实现:
        1.  前后端统一商量签名如何签，信息包括 授权的地址，校验码，设备 id， 组成生成 signature 后将相关信息通过接口方式发往服务端。
        2.  使用 publicKey 在数据库查询记录。 使用这条记录的 校验码、publicKey、signature 进行验签。若正确则将一些信息(暂时不知道是什么，可以先随便放点东西，比如失效时间之类的)包装成 token 返回给客户端，并将 token 存至服务器中，授权地址需要与 token 建立对应关系。
        3.  后续客户端在某些需要使用 token 的接口时需要带上 token，比如充值接口带入 token 解析收取 pmc 的地址需要在授权列表中。

## 交易模块(充值、提现)

### 充值

### 提现

## 邀请模块(邀请码相关、统计记录相关) invite

### 邀请码 code

#### 数据表

<!--  -->

-   新增以下表(这些字段表示 至少应该有某些字段)
-   i1 活动表 (新增一条默认数据 活动名为 “支付链充值推广活动”)
    -   活动 id
    -   活动名
-   i2 邀请码表
    -   邀请码
    -   活动 id
    -   添加时间
-   i3 邀请码设备关系表
    -   设备 id
    -   邀请码
    -   绑定时间
    -   活动 id
-   i4 邀请码地址关系表
    -   地址
    -   邀请码
    -   绑定时间
    -   活动 id
-   i5 邀请码关系表
    -   邀请码
    -   活动 id
    -   上级邀请码
    -   邀请时间
-   i6 支付链充值推广活动 邀请码信息表
    -   邀请码
    -   邀请成功数
    -   总邀请奖励 PMC 数
    -   总提现 PMC 数
-   i7 支付链充值推广活动 邀请码奖励详情表
    -   邀请码
    -   该邀请码的上级
    -   奖励 PMC 值
    -   关联的充值交易签名
    -   关联的充值交易来源链
    -   奖励发放时间
    -   奖励层级类型(直接奖励、一级奖励、二级奖励。。)
    -   详情细分类型(充值奖励)

#### 接口

-   获取我的邀请码
    -   path: GET myCode
    -   function: getMyInviteCode
    -   传入参数
        -   header 中需要有 token
    -   传出参数
        -   { [inviteCode: string]: string[] } 邀请码: 地址数组
    -   逻辑实现:
        1. 提供函数 生成邀请码 6 为 数字和字母组成区分大小写。共 (26+26+10)\*\*6 = 500 多亿个组合，生成的码需要不在 i2 表中
        2. 该接口能够直接根据 token 返回邀请码，token 中会存有邀请码，因为 token 中的授权地址是确定了，所以在获取 token 的时候 就已经能够得到邀请码了。下述函数是在获取 token 接口时就调用 这里只是阐述规则。
        3. 邀请码的规则如下:
            - token 能够解析出 deviceId 以及 addressArr
            1. 通过 deviceId 在 i3 表查询
                1. 有值 invite1
                    1. 查询 各个 address 在 i4 表中是否有值
                        1. 无值: 将地址与 invite1 建立关系
                        2. 有值 invite2: 不做处理
                2. 无值
                    1. 查询 各个 address 在 i4 表中是否有值
                        1. 无值: 直接根据函数生成邀请码，并在 i3 表中建立与 deviceId 的关系，在 i4 表中建立与所有 address 的关系。
                        2. 有值:
                            1. 有值的值不同 invite3，invite4: 根据绑定时间选择最早建立关系的 invite3 作为邀请码，在 i3 表中建立与 deviceId 的关系。
                            2. 有值的值相同 invite5: 在 i3 表中建立 deviceId 与 invite5 的关系。
-   获取我上级的邀请码
    -   path GET superiorCode
    -   function: getMySuperiorCode
    -   传入参数
        -   header 中需要有 token
    -   传出参数
        -   inviteCode 邀请码
    -   逻辑实现
        1. 直接从 i5 表中查询，并放入缓存中 (邀请关系一旦确定不可更改)

### 统计列表等信息

-   对应邀请记录等页面

#### 接口

-   获取我的邀请码的统计信息
    -   path: GET
    -   function:
    -   传入参数
        -   header 中需要有 token
        -   inviteCode 。
    -   传出参数
        -   根据页面情况返回
    -   逻辑实现:
        1. 使用 inviteCode 在 i6 表查询。
        2. 若有需昨日统计数据，考虑使用日报或者统计并作缓存实现。
-   根据邀请码信息获取奖励详情
