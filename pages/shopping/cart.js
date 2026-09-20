// 购物车页面
Page({
    data: {
      cartItems: [],
      totalPrice: 0,
      loading: false,
      baseUrl: 'http://localhost:8080' // API基础URL
    },
  
    onLoad: function() {
      console.log('购物车页面加载 onLoad');
      this.getShoppingCartList();
    },
  
    onShow: function() {
      console.log('购物车页面显示 onShow');
      this.getShoppingCartList();
    },
    
    // 获取购物车列表数据
    getShoppingCartList: function() {
      this.setData({ loading: true });
      
      // 检查用户是否登录
      const authentication = wx.getStorageSync('authentication');
      if (!authentication) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        this.setData({ loading: false });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/my/my'
          });
        }, 1500);
        return;
      }
      
      // 调用购物车列表API
      wx.request({
        url: this.data.baseUrl + '/user/shoppingCart/list',
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'authentication': authentication
        },
        success: res => {
          console.log('购物车数据:', res.data);
          if (res.data && res.data.code === 1) {
            // 处理API返回的购物车数据
            const cartData = res.data.data || [];
            const formattedCart = cartData.map(item => ({
              id: item.id,
              name: item.name,
              price: item.amount,
              quantity: item.number,
              image: item.image || '../../static/no_order.png',
              dishId: item.dishId,
              setmealId: item.setmealId,
              dishFlavor: item.dishFlavor,
              flavor: item.dishFlavor // 用于显示
            }));
            
            this.setData({
              cartItems: formattedCart
            }, () => {
      this.calculateTotal();
            });
          } else {
            this.setData({
              cartItems: [],
              totalPrice: '0.00'
            });
            wx.showToast({
              title: (res.data && res.data.msg) || '获取购物车失败',
              icon: 'none'
            });
          }
        },
        fail: err => {
          console.error('获取购物车列表失败:', err);
          this.setData({
            cartItems: [],
            totalPrice: '0.00'
          });
          wx.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none'
          });
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    },
    
    // 计算总价
    calculateTotal: function() {
      let total = 0;
      this.data.cartItems.forEach(item => {
        total += item.price * item.quantity;
      });
      
      this.setData({
        totalPrice: total.toFixed(2)
      });
    },
    
    // 增加数量
    increaseQuantity: function(e) {
      const id = e.currentTarget.dataset.id;
      const item = this.data.cartItems.find(item => item.id === id);
      if (!item) return;
      
      const authentication = wx.getStorageSync('authentication');
      if (!authentication) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 添加购物车
      const params = {
        dishId: item.dishId,
        setmealId: item.setmealId,
        dishFlavor: item.dishFlavor,
        number: 1
      };
      
      this.setData({ loading: true });
      
      wx.request({
        url: this.data.baseUrl + '/user/shoppingCart/add',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'authentication': authentication
        },
        data: params,
        success: res => {
          if (res.data && res.data.code === 1) {
            this.getShoppingCartList(); // 刷新购物车
      
      wx.showToast({
        title: '已添加',
        icon: 'none',
        duration: 500
            });
          } else {
            wx.showToast({
              title: (res.data && res.data.msg) || '添加失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none'
          });
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    },
    
    // 减少数量
    decreaseQuantity: function(e) {
      const id = e.currentTarget.dataset.id;
      const item = this.data.cartItems.find(item => item.id === id);
      if (!item) return;
      
      const authentication = wx.getStorageSync('authentication');
      if (!authentication) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 购物车减少
      const params = {
        dishId: item.dishId,
        setmealId: item.setmealId,
        dishFlavor: item.dishFlavor
      };
      
      this.setData({ loading: true });
      
      wx.request({
        url: this.data.baseUrl + '/user/shoppingCart/sub',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'authentication': authentication
        },
        data: params,
        success: res => {
          if (res.data && res.data.code === 1) {
            this.getShoppingCartList(); // 刷新购物车
      
      wx.showToast({
        title: '已减少',
        icon: 'none',
        duration: 500
            });
          } else {
            wx.showToast({
              title: (res.data && res.data.msg) || '减少失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none'
          });
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    },
    
    // 删除购物车商品
    deleteCartItem: function(e) {
      const id = e.currentTarget.dataset.id;
      const item = this.data.cartItems.find(item => item.id === id);
      if (!item) return;
      
      const authentication = wx.getStorageSync('authentication');
      if (!authentication) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      wx.showModal({
        title: '提示',
        content: '确定要删除该商品吗？',
        success: res => {
          if (res.confirm) {
            this.setData({ loading: true });
            
            // 调用删除购物车接口
            wx.request({
              url: this.data.baseUrl + '/user/shoppingCart/delete',
              method: 'DELETE',
              header: {
                'content-type': 'application/json',
                'authentication': authentication
              },
              data: {
                dishId: item.dishId,
                setmealId: item.setmealId,
                dishFlavor: item.dishFlavor
              },
              success: res => {
                if (res.data && res.data.code === 1) {
                  this.getShoppingCartList(); // 刷新购物车
                  
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                } else {
                  wx.showToast({
                    title: (res.data && res.data.msg) || '删除失败',
                    icon: 'none'
                  });
                }
              },
              fail: () => {
                wx.showToast({
                  title: '网络异常，请稍后再试',
                  icon: 'none'
                });
              },
              complete: () => {
                this.setData({ loading: false });
              }
            });
          }
        }
      });
    },
    
    // 清空购物车
    clearCart: function() {
      const authentication = wx.getStorageSync('authentication');
      if (!authentication) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      wx.showModal({
        title: '提示',
        content: '确定要清空购物车吗？',
        success: res => {
          if (res.confirm) {
            this.setData({ loading: true });
            
            // 调用清空购物车接口
            wx.request({
              url: this.data.baseUrl + '/user/shoppingCart/clean',
              method: 'DELETE',
              header: {
                'content-type': 'application/json',
                'authentication': authentication
              },
              success: res => {
                if (res.data && res.data.code === 1) {
            this.setData({
              cartItems: [],
              totalPrice: '0.00'
            });
            
            wx.showToast({
              title: '购物车已清空',
              icon: 'success'
                  });
                } else {
                  wx.showToast({
                    title: (res.data && res.data.msg) || '清空购物车失败',
                    icon: 'none'
                  });
                }
              },
              fail: () => {
                wx.showToast({
                  title: '网络异常，请稍后再试',
                  icon: 'none'
                });
              },
              complete: () => {
                this.setData({ loading: false });
              }
            });
          }
        }
      });
    },
    
    // 结算
    checkout: function() {
      if (this.data.cartItems.length === 0) {
        wx.showToast({
          title: '购物车为空',
          icon: 'none'
        });
        return;
      }
      
      const authentication = wx.getStorageSync('authentication');
      if (!authentication) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/my/my'
          });
        }, 1500);
        return;
      }
      
      // 跳转到订单确认页
        wx.navigateTo({
          url: '/pages/order/index'
        });
    }
  })