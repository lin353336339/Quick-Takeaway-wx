/**
 * API测试文件
 * 用于测试菜品和套餐API
 */

const dishApi = require('./dishApi');

/**
 * 测试获取所有菜品API
 */
function testGetAllDishes() {
  console.log('测试获取所有菜品API');
  dishApi.getAllDishes()
    .then(res => {
      console.log('所有菜品数据:', res);
    })
    .catch(err => {
      console.error('获取所有菜品失败:', err);
    });
}

/**
 * 测试获取所有套餐API
 */
function testGetAllSetmeals() {
  console.log('测试获取所有套餐API');
  dishApi.getAllSetmeals()
    .then(res => {
      console.log('所有套餐数据:', res);
    })
    .catch(err => {
      console.error('获取所有套餐失败:', err);
    });
}

// 模拟测试
// 注释掉以防自动执行
// testGetAllDishes();
// testGetAllSetmeals(); 