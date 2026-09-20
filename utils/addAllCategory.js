// 在商品页添加"全部"分类按钮的补丁

/**
 * 该函数应在获取分类列表后调用
 * 如在 handleCategoryList 或类似函数内部使用
 */
function addAllCategoryToList(categoryList) {
  // 检查是否已有"全部"分类
  const hasAll = categoryList.some(item => item.name === '全部' || item.id === 'all');
  
  // 如果没有"全部"分类，添加到列表开头
  if (!hasAll) {
    categoryList.unshift({
      id: 'all',
      name: '全部', 
      type: 'all'
    });
  }
  
  return categoryList;
}

/**
 * 当点击"全部"分类时调用该函数
 * 在 swichMenu 或类似函数中判断是否选中了"全部"分类
 */
function handleAllCategoryClick(typeItem, index, that) {
  // 如果点击的是"全部"分类
  if (typeItem.id === 'all' || typeItem.name === '全部') {
    // 更新索引
    that.setData({
      typeIndex: index
    });
    
    // 发送查询所有菜品的请求
    const getAuth = that.getAuthentication();
    
    // 查询所有菜品
    wx.request({
      url: 'http://localhost:8080/user/dish/all',
      method: 'GET',
      header: {
        'authentication': getAuth
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 保存所有菜品数据
          const allDishes = res.data.data || [];
          
          // 查询所有套餐
          wx.request({
            url: 'http://localhost:8080/user/setmeal/all',
            method: 'GET',
            header: {
              'authentication': getAuth
            },
            success: (setmealRes) => {
              if (setmealRes.data && setmealRes.data.code === 1) {
                // 合并菜品和套餐数据
                const allGoods = [...allDishes, ...(setmealRes.data.data || [])];
                
                // 更新页面显示的菜品列表
                that.setData({
                  dishListItems: allGoods
                });
                
                // 关闭加载状态
                that.setData({
                  loaddingSt: false
                });
              }
            },
            fail: () => {
              // 加载失败处理
              that.setData({
                loaddingSt: false
              });
            }
          });
        }
      },
      fail: () => {
        // 加载失败处理
        that.setData({
          loaddingSt: false
        });
      }
    });
    
    // 阻止默认的分类切换逻辑
    return true;
  }
  
  // 不是"全部"分类，返回false让默认逻辑处理
  return false;
}

// 导出函数以便使用
module.exports = {
  addAllCategoryToList,
  handleAllCategoryClick
}; 