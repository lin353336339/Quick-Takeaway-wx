/**
 * 商品页面功能扩展
 * 为commodity页面添加"全部"分类功能
 */

const dishApi = require('./dishApi');

/**
 * 初始化全部分类功能
 * 在页面加载完成后执行
 */
function initAllCategoryFeature() {
  const pages = getCurrentPages();
  if (!pages || pages.length === 0) return;
  
  // 获取当前页面对象
  const currentPage = pages[pages.length - 1];
  if (!currentPage || currentPage.route !== 'pages/commodity/commodity') return;
  
  // 备份原始方法
  const originalOnLoad = currentPage.onLoad;
  const originalOnShow = currentPage.onShow;
  
  // 重写onLoad方法
  currentPage.onLoad = function(options) {
    // 调用原始onLoad
    if (originalOnLoad) {
      originalOnLoad.call(this, options);
    }
    
    // 添加页面加载完成标志
    this.pageFullyLoaded = false;
    
    // 添加"全部"分类逻辑
    this.addAllCategoryOption = function() {
      // 检查是否已经存在"全部"分类
      const allCategoryExists = this.data.typeListData.some(item => item.name === '全部');
      if (!allCategoryExists) {
        // 添加"全部"分类选项
        const allCategory = {
          id: -1,
          name: '全部',
          type: -1
        };
        
        // 插入到分类列表前面
        const updatedTypeList = [allCategory, ...this.data.typeListData];
        this.setData({
          typeListData: updatedTypeList
        });
      }
    };
    
    // 增强菜单切换方法
    const originalSwichMenu = this.swichMenu;
    this.swichMenu = function(item, index) {
      console.log('切换菜单:', item, '索引:', index);
      
      // 检查是否是"全部"分类
      if (index === 0 && this.data.typeListData[0].name === '全部') {
        console.log('切换到"全部"分类');
        // 加载所有菜品和套餐
        this.loadAllDishesAndSetmeals();
        // 更新选中索引
        this.setData({
          typeIndex: index
        });
      } else {
        console.log('切换到分类:', item.name, '分类ID:', item.id);
        // 调用原始切换方法
        try {
          originalSwichMenu.call(this, item, index);
          console.log('分类切换成功');
        } catch (error) {
          console.error('分类切换出错:', error);
          
          // 尝试直接通过设置typeIndex来切换
          this.setData({
            typeIndex: index
          });
          
          // 然后手动请求该分类下的商品
          this.getDishList(item.id);
        }
      }
    };
    
    // 添加加载所有菜品和套餐的方法
    this.loadAllDishesAndSetmeals = function() {
      const that = this;
      
      // 显示加载中
      this.setData({
        loaddingSt: true
      });
      
      // 同时请求所有菜品和套餐
      Promise.all([
        dishApi.getAllDishes(),
        dishApi.getAllSetmeals()
      ]).then(([dishes, setmeals]) => {
        // 合并菜品和套餐数据
        const allItems = [...dishes, ...setmeals];
        
        // 更新显示数据
        that.setData({
          dishListItems: allItems || [],
          loaddingSt: false
        });

        // 检查是否需要自动选中商品
        that.checkAndSelectDish();
      }).catch(err => {
        console.error('加载所有菜品和套餐出错', err);
        that.setData({
          dishListItems: [],
          loaddingSt: false
        });
      });
    };
    
    // 添加自动定位到指定商品的方法
    this.locateToDish = function(dishInfo) {
      if (!dishInfo || !this.data.typeListData) return;
      
      console.log('开始定位商品:', dishInfo);
      console.log('当前分类列表:', this.data.typeListData);
      
      const that = this;
      let foundCategory = false;
      let categoryIndex = 0;
      
      // 如果有分类ID，先切换到对应分类
      if (dishInfo.categoryId) {
        // 分类ID转为数字以确保比较正确
        const targetCategoryId = Number(dishInfo.categoryId);
        console.log('目标分类ID:', targetCategoryId);
        
        // 查找分类索引
        this.data.typeListData.forEach((category, index) => {
          const currentCategoryId = Number(category.id);
          console.log(`比较分类: ${currentCategoryId} == ${targetCategoryId}`);
          
          if (currentCategoryId === targetCategoryId) {
            foundCategory = true;
            categoryIndex = index;
            console.log('找到匹配分类，索引:', index, '分类:', category);
          }
        });
        
        if (foundCategory) {
          // 切换到对应分类
          console.log('切换到分类索引:', categoryIndex);
          const category = this.data.typeListData[categoryIndex];
          
          // 显示提示信息
          wx.showToast({
            title: '已找到分类: ' + category.name,
            icon: 'none',
            duration: 1500
          });
          
          this.swichMenu(category, categoryIndex);
          
          // 等待分类数据加载完成，然后选中商品
          setTimeout(() => {
            that.selectDishInCurrentCategory(dishInfo);
          }, 800);
        } else {
          console.log('未找到匹配分类，使用全部分类');
          // 如果找不到分类，使用全部分类
          this.swichMenu(this.data.typeListData[0], 0);
          
          // 等待数据加载完成，然后选中商品
          setTimeout(() => {
            that.selectDishInCurrentCategory(dishInfo);
          }, 800);
        }
      } else {
        console.log('商品无分类ID，使用全部分类');
        // 没有分类ID，使用全部分类
        this.swichMenu(this.data.typeListData[0], 0);
        
        // 等待数据加载完成，然后选中商品
        setTimeout(() => {
          that.selectDishInCurrentCategory(dishInfo);
        }, 800);
      }
    };
    
    // 在当前分类中选中指定商品
    this.selectDishInCurrentCategory = function(dishInfo) {
      if (!dishInfo || !this.data.dishListItems) return;
      
      console.log('当前分类中的商品列表:', this.data.dishListItems);
      
      // 在当前分类的菜品列表中查找指定商品
      const targetDishId = dishInfo.id;
      const targetDishId2 = dishInfo.dishId;
      const targetSetmealId = dishInfo.setmealId;
      
      console.log('查找商品ID:', targetDishId, '菜品ID:', targetDishId2, '套餐ID:', targetSetmealId);
      
      // 尝试多种匹配方式
      let targetDishIndex = -1;
      
      // 优先使用dishId或setmealId匹配
      if (targetDishId2) {
        targetDishIndex = this.data.dishListItems.findIndex(item => 
          item.id === targetDishId2 || String(item.id) === String(targetDishId2)
        );
        console.log('通过dishId查找结果:', targetDishIndex);
      }
      
      if (targetDishIndex === -1 && targetSetmealId) {
        targetDishIndex = this.data.dishListItems.findIndex(item => 
          item.id === targetSetmealId || String(item.id) === String(targetSetmealId)
        );
        console.log('通过setmealId查找结果:', targetDishIndex);
      }
      
      // 如果还是找不到，尝试用id匹配
      if (targetDishIndex === -1 && targetDishId) {
        targetDishIndex = this.data.dishListItems.findIndex(item => 
          item.id === targetDishId || String(item.id) === String(targetDishId)
        );
        console.log('通过id查找结果:', targetDishIndex);
      }
      
      // 最后尝试用名称匹配
      if (targetDishIndex === -1 && dishInfo.name) {
        targetDishIndex = this.data.dishListItems.findIndex(item => 
          item.name === dishInfo.name
        );
        console.log('通过name查找结果:', targetDishIndex);
      }
      
      if (targetDishIndex !== -1) {
        // 找到商品，自动显示详情
        const targetDish = this.data.dishListItems[targetDishIndex];
        console.log('找到商品，准备打开详情:', targetDish);
        
        // 调用原有的打开详情方法
        setTimeout(() => {
          this.openDetailPopup(targetDish);
          
          // 显示成功提示
          wx.showToast({
            title: '已找到商品',
            icon: 'success',
            duration: 1500
          });
        }, 300);
      } else {
        console.log('未找到指定商品', dishInfo);
        wx.showToast({
          title: '未找到指定商品',
          icon: 'none',
          duration: 1500
        });
      }
    };
    
    // 检查全局状态中是否有选定的商品
    this.checkAndSelectDish = function() {
      const app = getApp();
      if (app.globalData && app.globalData.selectedDishInfo) {
        const dishInfo = app.globalData.selectedDishInfo;
        console.log('检测到选定商品:', dishInfo);
        
        // 设置一个延迟，确保页面完全加载
        setTimeout(() => {
          if (this.data.typeListData && this.data.typeListData.length > 0) {
            console.log('开始定位商品，当前分类列表:', this.data.typeListData);
            
            // 检查页面是否已完全加载
            if (!this.pageFullyLoaded) {
              console.log('页面尚未完全加载，等待后再尝试');
              setTimeout(() => {
                this.checkAndSelectDish();
              }, 1000);
              return;
            }
            
            // 定位到商品
            this.locateToDish(dishInfo);
            
            // 使用完后清除，避免重复触发
            app.globalData.selectedDishInfo = null;
          } else {
            console.log('分类列表还未加载完成，稍后再试');
            // 再次尝试
            setTimeout(() => {
              this.checkAndSelectDish();
            }, 1000);
          }
        }, 1000);
      }
    };
    
    // 添加getDishList方法，用于手动获取分类下的商品列表
    if (!this.getDishList) {
      this.getDishList = function(categoryId) {
        console.log('手动获取分类下的商品列表, 分类ID:', categoryId);
        
        const that = this;
        const app = getApp();
        const authentication = app.getAuthentication();
        
        // 显示加载中
        this.setData({
          loaddingSt: true
        });
        
        // 根据分类ID获取商品列表
        wx.request({
          url: `http://localhost:8080/user/dish/list?categoryId=${categoryId}`,
          method: 'GET',
          header: {
            'authentication': authentication
          },
          success: function(res) {
            console.log('获取分类商品成功:', res);
            if (res.data && res.data.code === 1) {
              that.setData({
                dishListItems: res.data.data || [],
                loaddingSt: false
              });
            } else {
              that.setData({
                dishListItems: [],
                loaddingSt: false
              });
            }
          },
          fail: function(err) {
            console.error('获取分类商品失败:', err);
            that.setData({
              dishListItems: [],
              loaddingSt: false
            });
          }
        });
      };
    }
    
    // 初次执行添加"全部"分类
    setTimeout(() => {
      this.addAllCategoryOption();
    }, 500);
    
    // 监听页面渲染完成事件
    wx.onWindowResize(() => {
      if (!this.pageFullyLoaded) {
        console.log('页面渲染完成，设置标志位');
        this.pageFullyLoaded = true;
      }
    });
    
    // 即使没有窗口大小变化，也在一定时间后认为页面加载完成
    setTimeout(() => {
      if (!this.pageFullyLoaded) {
        console.log('页面加载超时，设置标志位');
        this.pageFullyLoaded = true;
      }
    }, 3000);
  };
  
  // 重写onShow方法，每次显示页面都检查是否有需要选中的商品
  currentPage.onShow = function() {
    // 调用原始onShow
    if (originalOnShow) {
      originalOnShow.call(this);
    }
    
    // 设置一个延迟，确保页面渲染完成
    setTimeout(() => {
      // 标记页面已加载完成
      this.pageFullyLoaded = true;
      
      // 检查是否有需要选中的商品
      if (this.checkAndSelectDish) {
        this.checkAndSelectDish();
      }
    }, 1500);
  };
}

// 初始化功能
initAllCategoryFeature(); 