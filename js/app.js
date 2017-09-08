// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .controller('cartList', function ($scope, Data) {
    /*思路: 
      在非编辑状态，商品添加进购物车时，默认为选中状态；选中则计算对应商品的数量和总价格，再计算最后的总价和总数量。

      总价等于单个购物车中被选中商品总价相加
    
      进入编辑状态，记录购物车中商品在非编辑的选中情况$scope.goodsChecked[i].preChecked，
      然后所有购物车中商品改为不选中，添加新的商品到购物车中也默认为不选中。

      退出编辑状态，购物车中之前就有的商品恢复之前的选中状态，在编辑状态添加进购物车的商品则为不选中状态。计算总价和数量
      
     */

    /* 遇到的问题：
      1. 在方法中使用 $index 来获取索引时，编辑状态删除了商品之后，$index获取到的索引不是之前的，所以会报错。
      参考 http://web.jobbole.com/82470/  将传入的$index 改为了item，就解决了这个问题。

      2. 一开始的时候把购物车和下方的推荐列表放在了两个controller里面，导致最后的factory中很多公共数据需要引用，
      不过考虑到这个是单个页面，所以后来还是合并到一个controller，保留factory里面的的公共数组。

    */
    $scope.goodsData = Data.goodslist; //商品列表，获取Data中的数据
    $scope.goodsChecked = Data.goodsChecked; //被添加到购物车的商品    

    $scope.addGoods = function (item) { //添加商品到购物车
      var index = $scope.goodsChecked.indexOf(item);

      if (index != -1) {  //检查商品是否已经添加到购物车中
        item.count = ++$scope.goodsChecked[index].count;
        item.isDisabled = false;
      }
      else {
        item.count = 0;
        item.count++; //加入购物车后，购物车中该商品数量默认为1
        item.isDisabled = true;
        if ($scope.toEdit == false) {
          item.checked = true;
          $scope.selcetAll = true;
        }
        else {
          item.checked = false;
          $scope.selcetAll = false;
        }
        $scope.goodsChecked.push(item);
      }
      $scope.account();
    }

    $scope.addCount = function (item) {  //增加单个商品数量
      item.singleTotal = 0; //每次计算需将单个商品的数值重置为零
      item.count++; // 购物车中单个货物数量

      if (item.count > 1) {
        item.isDisabled = false;
      }
      $scope.account();
    }

    $scope.decreaseCount = function (item) { //减少单个商品数量
      item.singleTotal = 0;
      item.count--;

      if (item.count == 1) {
        item.isDisabled = true;
      }
      $scope.account();
    }

    $scope.toggleChecked = function (item) {
      item.checked = !item.checked; //切换选择取消

      var a = 0; //统计选中的数量
      for (var i = 0; i < $scope.goodsChecked.length; i++) { //购物车中有未选中结算的商品，全选项即为未选中
        if ($scope.goodsChecked[i].checked == true) {
          a++;  //选中的个数
        }
      }
      if (a == $scope.goodsChecked.length) {
        $scope.selcetAll = true;
      } else {
        $scope.selcetAll = false;
      }
      if ($scope.toEdit == false) {
        $scope.account();
      }
    }

    $scope.checkAll = function () {  //全选，结算全部购物车中商品
      $scope.selcetAll = !$scope.selcetAll;
      for (var i = 0; i < $scope.goodsChecked.length; i++) {
        $scope.goodsChecked[i].checked = $scope.selcetAll;
      }
      $scope.account();
    }

    $scope.toEdit = false;
    $scope.editFunc = function () { //切换为编辑状态
      $scope.toEdit = true;
      $scope.preChecked = $scope.selcetAll;
      $scope.selcetAll = false;
      for (var i = 0; i < $scope.goodsChecked.length; i++) {
        $scope.goodsChecked[i].preChecked = $scope.goodsChecked[i].checked;
        $scope.goodsChecked[i].checked = false;
      }
    }

    $scope.okFunc = function () { //退出编辑状态
      var a = 0;
      $scope.toEdit = false;
      for (var i = 0; i < $scope.goodsChecked.length; i++) {
        $scope.goodsChecked[i].checked = $scope.goodsChecked[i].preChecked;
        if ($scope.goodsChecked[i].checked == true) {
          a++;
        }
      }

      if (a == $scope.goodsChecked.length && $scope.goodsChecked.length != 0) {
        $scope.selcetAll = true;
      }
      $scope.account();
    }

    $scope.deleteGood = function () { //编辑状态下删除被选中的商品
      if ($scope.toEdit == true && $scope.goodsChecked.length > 0) {
        for (var i = 0; i < $scope.goodsChecked.length; i++) {
          if ($scope.goodsChecked[i].checked == true) {
            $scope.goodsChecked.splice($scope.goodsChecked.indexOf($scope.goodsChecked[i]), 1);
            i--;//因为删除了一项，$scope.goodsChecked的长度就减少了一个
          }
          if ($scope.goodsChecked.length == 0) {
            $scope.selcetAll = false;
          }
        }
      }

    }

    $scope.account = function () { //计算总价
      $scope.sum = 0;
      $scope.totalValue = 0;
      for (var i = 0; i < $scope.goodsChecked.length; i++) {
        $scope.goodsChecked[i].singleTotal = 0;
        if ($scope.goodsChecked[i].checked) {
          $scope.goodsChecked[i].singleTotal = $scope.goodsChecked[i].price * $scope.goodsChecked[i].count; //单个商品的总价格
          $scope.sum += $scope.goodsChecked[i].count; //计算总数量
        } else if ($scope.goodsChecked[i].checked == false) {
          $scope.goodsChecked[i].singleTotal = 0;
        }
        $scope.totalValue += $scope.goodsChecked[i].singleTotal; //计算总价
      }
    }
  })

  .factory('Data', function () { //公共数据
    return {
      goodsChecked: [],  //被添加到购物车的商品 
      goodslist: [   //商品列表
        {
          id: 1,
          name: "360随身WiFi3 300M 无线网卡 迷你路由器 黑色",
          image: "img/1.jpg",
          price: 24.8,
          store: "京东自营",
          dimension: "",
          color: "黑色",
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 2,
          name: "金士顿（Kingston）32GB 80MB/s TF(Micro SD)Class10 UHS-I高速存储卡  ",
          image: "img/2.jpg",
          price: 87.9,
          store: "京东自营",
          dimension: "32GB",
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 3,
          name: "【京东超市】福临门 东北大米 水晶米 中粮出品 大米5kg",
          image: "img/3.jpg",
          price: 29.9,
          store: "京东自营",
          dimension: "",
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 4,
          name: "斐讯K2 1200M智能双频无线路由器 WIFI穿墙 PSG1218",
          image: "img/4.jpg",
          price: 399,
          store: "京东自营",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 5,
          name: "【京东超市】帮宝适（Pampers）超薄干爽 婴儿纸尿裤 大号L164片【9-14kg】",
          image: "img/5.jpg",
          price: 199,
          store: "京东自营",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 6,
          name: "【京东超市】德国 进口牛奶 欧德堡（Oldenburger）超高温处理全脂纯牛奶1L*12",
          image: "img/6.jpg",
          price: 119,
          store: "京东自营",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 7,
          name: "【京东超市】科尔沁 休闲肉脯零食 内蒙古特产 手撕风干牛肉干孜然味400g",
          image: "img/7.jpg",
          price: 99,
          store: "京东自营",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 8,
          name: "三星（SAMSUNG）32GB UHS-1 Class10 TF(Micro SD)存储卡（读速80Mb/s）升级版",
          image: "img/8.jpg",
          price: 79.9,
          store: "三星数码专营店",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 9,
          name: "小米（MI）智能手环1代【光感心率版】小米手环 黑色腕带 LED指示灯 运动数据/心率监测 睡眠监测",
          image: "img/9.jpg",
          price: 69,
          store: "小米专卖店",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        {
          id: 10,
          name: "【京东超市】光明 莫斯利安 常温酸奶酸牛奶(原味)350g*6盒/礼盒装",
          image: "img/10.jpg",
          price: 33.9,
          store: "京东自营",
          dimension: ["黄色", "绿色"],
          color: ["黑色", " 淡蓝", "红色", "360安全充电"],
          version: [""],
          promotion: "购满29.90元，可用优惠价换购商品"
        },
        // { name: "三只松鼠_碧根果210gx2袋零食坚果炒货山核桃长寿果干果奶油味", image: "img/11.jpg", price: 38.9 },
        // { name: "【京东超市】意大利进口 Balocco 百乐可 脆皮酥 焦糖味 200g", image: "img/12.jpg", price: 26.8 },
        // { name: "Apple iPhone 5s (A1530) 16GB 金色 移动联通4G手机", image: "img/13.jpg", price: 1699 },
        // { name: "西部数据(WD)蓝盘 1TB SATA6Gb/s 7200转64M 台式机硬盘(WD10EZEX)", image: "img/14.jpg", price: 299 },
        // { name: "【京东超市】百草味 坚果零食干果 内含开果器 夏威夷果奶油味200g/袋", image: "img/15.jpg", price: 18.9 },
        // { name: "【京东超市】意大利进口 Balocco 百乐可 饼干 鲜奶油蜂蜜味　350g", image: "img/16.jpg", price: 15.8 },
        // { name: "TP-LINK TL-WR886N 450M无线路由器（宝蓝） WIFI无线穿墙王", image: "img/17.jpg", price: 99 },
        // { name: "丽家家居 礼品门垫浴室垫子进门脚垫防滑地垫 花色随机 尺寸随机 礼品门垫 花色随机发 礼品门垫 花色随机 尺寸随机", image: "img/18.jpg", price: 9.9 },
        // { name: "【京东超市】蒙牛 纯牛奶 PURE MILK 250ml*16盒", image: "img/19.jpg", price: 39.9 },
        // { name: "【京东超市】德芙Dove巧克力分享碗装 什锦牛奶榛仁葡萄干巧克力糖果巧克力休闲零食249g", image: "img/20.jpg", price: 29.9 },
        // { name: "网易云音乐车载蓝牙播放器 点烟器式双USB车充 车载充电器 蓝牙FM发射器 智能车充 炫酷黑", image: "img/21.jpg", price: 119 },
        // { name: "奥克斯（AUX）正1.5匹 冷暖 定速 空调挂机(KFR-35GW/HFJ+3)", image: "img/22.jpg", price: 1899 }
      ]
    }
  })

