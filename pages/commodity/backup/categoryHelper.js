// 商品分类辅助文件

// 将"全部"分类添加到分类列表开头
function addAllCategory(typeListData) {
  if (!typeListData || typeListData.length === 0) {
    return [{
      id: 'all',
      name: '全部',
      type: 'all'
    }];
  }
  
  // 判断是否已经有"全部"分类
  const hasAll = typeListData.some(item => item.id === 'all' || item.name === '全部');
  
  if (!hasAll) {
    return [{
      id: 'all',
      name: '全部',
      type: 'all'
    }, ...typeListData];
  }
  
  return typeListData;
}

// 获取所有分类下的菜品
function getAllDishes(categoryDishes) {
  let allDishes = [];
  if (!categoryDishes) return allDishes;
  
  Object.values(categoryDishes).forEach(dishes => {
    if (Array.isArray(dishes)) {
      allDishes = allDishes.concat(dishes);
    }
  });
  
  return allDishes;
}

// 更新分类选择逻辑
function updateDishListForCategory(typeIndex, typeListData, categoryDishes) {
  // 如果选择的是"全部"分类
  if (typeIndex === 0 && typeListData[0] && (typeListData[0].id === 'all' || typeListData[0].name === '全部')) {
    return getAllDishes(categoryDishes);
  }
  
  // 否则返回对应分类的菜品
  const currentCategory = typeListData[typeIndex];
  if (!currentCategory) return [];
  
  return categoryDishes[currentCategory.id] || [];
}

module.exports = {
  addAllCategory,
  getAllDishes,
  updateDishListForCategory
}; 