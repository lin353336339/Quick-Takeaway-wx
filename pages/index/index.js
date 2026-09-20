Page({
  data: {
    storeData: {
      orderCompletionRate: 0,
      orderCount: 0,
      userOrderCount: 0
    },
    loading: true,
    authentication: null,
    promotionItems: [], // 轮播图数据
    top10List: [], // 销量Top10数据
    phoneData: {
      phoneNumber: '400-618-4000',
      showPhone: false
    }
  },
  onLoad: function() {
    // 获取全局的authentication值
    this.getAuthenticationFromGlobal();
    
    // 初始化时获取数据
    this.getStoreData();
    
    // 获取轮播图数据
    this.getCarouselData();
    
    // 获取销量Top10数据
    this.getTop10Data();
  },
  
  onShow: function() {
    // 每次页面显示时获取最新的authentication值
    this.getAuthenticationFromGlobal();
    
    // 检查是否登录，若未登录则提示登录
    if (!this.data.authentication || this.data.authentication === "null") {
      this.showLoginModal();
    }
  },
  
  // 显示登录提示框
  showLoginModal: function() {
    var _this = this;
    uni.showModal({
      title: '温馨提示',
      content: '授权微信登录后才能点餐！',
      showCancel: false,
      success: function success(res) {
        if (res.confirm) {
          _this.handleLogin();
        }
      }
    });
  },
  
  // 处理登录逻辑
  handleLogin: function() {
    var _this = this;
    var jsCode = '';
    uni.login({
      provider: 'weixin',
      success: function success(loginRes) {
        if (loginRes.errMsg === 'login:ok') {
          console.log('-=-=-=-=loginRes-=-=-=', loginRes);
          jsCode = loginRes.code;
          
          // 获取用户信息
          uni.getUserProfile({
            desc: '登录',
            success: function success(userInfo) {
              var app = getApp();
              // 保存用户信息到全局
              app.setUserInfo(userInfo.userInfo);
              
              var params = {
                code: jsCode
              };
              
              console.log(userInfo.userInfo, '用户信息');
              // 发起登录请求
              wx.request({
                url: 'http://localhost:8080/user/user/login',
                method: 'POST',
                data: params,
                success: function(success) {
                  if (success.data.code === 1) {
                    app.setAuthentication(success.data.data.token);
                    app.setUserInfo(success.data.data.userInfo);
                    
                    // 更新页面数据
                    _this.setData({
                      authentication: success.data.data.token
                    });
                    
                    // 重新获取数据
                    _this.getStoreData();
                    _this.getCarouselData();
                    _this.getTop10Data();
                    
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success'
                    });
                  }
                },
                fail: function(err) {
                  console.error('登录失败:', err);
                  wx.showToast({
                    title: '登录失败',
                    icon: 'error'
                  });
                }
              });
            },
            fail: function fail(err) {
              console.error('获取用户信息失败:', err);
              wx.showToast({
                title: '授权失败',
                icon: 'error'
              });
            }
          });
        }
      },
      fail: function(err) {
        console.error('微信登录失败:', err);
      }
    });
  },
  
  // 获取轮播图数据
  getCarouselData: function() {
    const authentication = this.getAuthenticationFromGlobal();
    
    wx.request({
      url: 'http://localhost:8080/user/index/Carousel',
      method: 'GET',
      header: {
        'authentication': authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const carouselData = res.data.data;
          const promotionItems = [];
          
          // 添加最畅销菜品
          if (carouselData.mostSalesDish) {
            promotionItems.push({
              id: carouselData.mostSalesDish.id ? carouselData.mostSalesDish.id.toString() : '',
              title: '畅销菜品',
              name: carouselData.mostSalesDish.name || '',
              price: carouselData.mostSalesDish.price ? carouselData.mostSalesDish.price.toString() : '0',
              image: carouselData.mostSalesDish.image || '/static/imgDefault.png'
            });
          }
          
          // 添加最畅销套餐
          if (carouselData.mostSalesSetmeal) {
            promotionItems.push({
              id: carouselData.mostSalesSetmeal.id ? carouselData.mostSalesSetmeal.id.toString() : '',
              title: '畅销套餐',
              name: carouselData.mostSalesSetmeal.name || '',
              price: carouselData.mostSalesSetmeal.price ? carouselData.mostSalesSetmeal.price.toString() : '0',
              image: carouselData.mostSalesSetmeal.image || '/static/imgDefault.png'
            });
          }
          
          // 添加新品菜品
          if (carouselData.newdish) {
            promotionItems.push({
              id: carouselData.newdish.id ? carouselData.newdish.id.toString() : '',
              title: '新品上市',
              name: carouselData.newdish.name || '',
              price: carouselData.newdish.price ? carouselData.newdish.price.toString() : '0',
              image: carouselData.newdish.image || '/static/imgDefault.png'
            });
          }
          
          // 如果没有获取到任何数据，添加默认项
          if (promotionItems.length === 0) {
            promotionItems.push({
              id: 'default',
              title: '推荐套餐',
              name: '美味套餐',
              price: '88',
              image: '/static/icon.png'
            });
          }
          
          this.setData({
            promotionItems: promotionItems
          });
        } else {
          console.error('获取轮播图数据失败:', res);
          // 设置默认数据
          this.setDefaultCarouselData();
        }
      },
      fail: (err) => {
        console.error('获取轮播图数据请求失败:', err);
        // 设置默认数据
        this.setDefaultCarouselData();
      }
    });
  },
  
  // 设置默认轮播图数据（当API请求失败时）
  setDefaultCarouselData: function() {
    this.setData({
      promotionItems: [
        {
          id: 'lin353336339',
          title: '畅销套餐',
          name: '经典套餐',
          price: '70',
          image: '/static/logo_ruiji.png'
        },
        {
          id: 'lin353336340',
          title: '热卖套餐',
          name: '人气套餐',
          price: '88',
          image: '/static/img2.jpg'
        },
        {
          id: 'lin353336341',
          title: '新品上市',
          name: '特色套餐',
          price: '99',
          image: '/static/logo.png'
        }
      ]
    });
  },
  
  // 从全局获取authentication值
  getAuthenticationFromGlobal: function() {
    const app = getApp();
    // 优先从全局获取，如果没有则尝试从本地存储获取
    let authentication = app.getAuthentication();
    
    if (authentication === "null" || authentication === null) {
      // 尝试从本地存储获取
      authentication = wx.getStorageSync('authentication');
      // 如果本地存储中也有值，更新到全局
      if (authentication && authentication !== "null") {
        app.setAuthentication(authentication);
      }
    } else {
      // 将有效的authentication保存到本地存储
      wx.setStorageSync('authentication', authentication);
    }
    
    this.setData({
      authentication: authentication
    });
    
    return authentication;
  },
  
  // 手动刷新authentication
  refreshAuthentication: function() {
    this.getAuthenticationFromGlobal();
    wx.showToast({
      title: '已刷新认证状态',
      icon: 'success',
      duration: 1500
    });
  },
  
  // 获取店铺数据
  getStoreData: function() {
    this.setData({
      loading: true
    });
    
    // 获取最新的authentication值
    const authentication = this.getAuthenticationFromGlobal();
    
    wx.request({
      url: 'http://localhost:8080/user/index/businessStore',
      method: 'GET',
      header: {
        'authentication': authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const storeData = res.data.data || {
            orderCompletionRate: 0,
            orderCount: 0,
            userOrderCount: 0
          };
          
          // 处理订单完成率，将其转换为百分比并保留整数
          if (storeData.orderCompletionRate !== undefined) {
            storeData.orderCompletionRate = parseInt(storeData.orderCompletionRate * 100);
          }
          
          this.setData({
            storeData: storeData,
            loading: false
          });
        } else {
          this.setData({
            loading: false
          });
          console.error('获取店铺数据失败:', res);
        }
      },
      fail: (err) => {
        this.setData({
          loading: false
        });
        console.error('获取店铺数据请求失败:', err);
      }
    });
  },
  
  // 获取销量Top10数据
  getTop10Data: function() {
    const authentication = this.getAuthenticationFromGlobal();
    
    wx.request({
      url: 'http://localhost:8080/user/index/top10',
      method: 'GET',
      header: {
        'authentication': authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          let top10List = res.data.data || [];
          
          // 处理数据，确保每个项目都有id字段
          top10List = top10List.map(item => {
            // 如果item没有id字段，使用dishId或setmealId作为id
            if (!item.id) {
              return {
                ...item,
                id: item.dishId || item.setmealId || ''
              };
            }
            return item;
          });
          
          console.log('获取到的TOP10数据:', top10List);
          
          this.setData({
            top10List: top10List
          });
        } else {
          console.error('获取Top10数据失败:', res);
          // 设置默认数据
          this.setDefaultTop10Data();
        }
      },
      fail: (err) => {
        console.error('获取Top10数据请求失败:', err);
        // 设置默认数据
        this.setDefaultTop10Data();
      }
    });
  },
  
  // 设置默认Top10数据（当API请求失败时）
  setDefaultTop10Data: function() {
    this.setData({
      top10List: [
        {
          id: '1001',
          name: '无骨鸡爪',
          image: '/static/img2.jpg',
          amount: '38',
          number: 130,
          categoryId: 1,
          dishId: 1001
        },
        {
          id: '1002',
          name: '香辣蟹',
          image: '/static/icon.png',
          amount: '58',
          number: 108,
          categoryId: 2,
          dishId: 1002
        },
        {
          id: '1003',
          name: '口味虾',
          image: '/static/img2.jpg',
          amount: '48',
          number: 95,
          categoryId: 1,
          dishId: 1003
        }
      ]
    });
  },
  
  // 前往商品页面
  goToCommodity: function() {
    wx.switchTab({
      url: '/pages/commodity/commodity'
    });
  },
  
  // 打开菜品详情
  openDishDetail: function(e) {
    const dish = e.currentTarget.dataset.dish;
    if(dish && dish.id) {
      // 检查商品是否已下架(categoryId=0表示已下架)
      if(dish.categoryId === 0) {
        wx.showToast({
          title: '该商品已下架',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 获取商品ID和分类ID
      const dishId = dish.dishId || null;
      const setmealId = dish.setmealId || null;
      const id = dish.id;
      const categoryId = dish.categoryId || null;
      
      // 跳转到商品页面并传递参数
      wx.switchTab({
        url: '/pages/commodity/commodity',
        success: function() {
          // 在跳转成功后设置全局状态
          const app = getApp();
          if(!app.globalData) {
            app.globalData = {};
          }
          
          // 保存商品信息到全局状态
          app.globalData.selectedDishInfo = {
            id: id,
            dishId: dishId,
            setmealId: setmealId,
            categoryId: categoryId,
            name: dish.name,
            image: dish.image
          };
        }
      });
    }
  },
  
  // 处理电话点击
  handlePhone: function() {
    var phoneData = this.data.phoneData;
    this.setData({
      'phoneData.showPhone': !phoneData.showPhone
    });
    
    if (this.data.phoneData.showPhone) {
      wx.makePhoneCall({
        phoneNumber: this.data.phoneData.phoneNumber,
        fail: function() {
          console.log('取消拨打电话');
        }
      });
    }
  }
})
 