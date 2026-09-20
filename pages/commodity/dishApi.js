/**
 * 菜品和套餐API服务
 * 包含查询所有菜品和套餐的接口
 */

// API基础URL
const BASE_URL = 'http://localhost:8080';

/**
 * 查询所有菜品
 * @returns {Promise} 返回请求Promise
 */
function getAllDishes() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/user/dish/all`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authentication': getAuthentication()
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          resolve(res.data.data || []);
        } else {
          resolve([]);
          console.error('获取所有菜品失败', res);
        }
      },
      fail: (err) => {
        console.error('获取所有菜品请求错误', err);
        reject(err);
      }
    });
  });
}

/**
 * 查询所有套餐
 * @returns {Promise} 返回请求Promise
 */
function getAllSetmeals() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/user/setmeal/all`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authentication': getAuthentication()
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          resolve(res.data.data || []);
        } else {
          resolve([]);
          console.error('获取所有套餐失败', res);
        }
      },
      fail: (err) => {
        console.error('获取所有套餐请求错误', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取身份验证信息
 * @returns {string} 身份验证信息
 */
function getAuthentication() {
  const app = getApp();
  if (app && app.getAuthentication) {
    return app.getAuthentication();
  }
  return wx.getStorageSync('authentication') || '';
}

module.exports = {
  getAllDishes,
  getAllSetmeals
}; 