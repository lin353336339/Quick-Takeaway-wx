// 自定义分类组件
const app = getApp();

Component({
  properties: {
    typeListData: {
      type: Array,
      value: [],
      observer: function(newVal) {
        if (newVal && newVal.length > 0) {
          // 添加全部分类
          const updatedList = this.addAllCategory(newVal);
          this.setData({
            categories: updatedList
          });
          // 通知父组件更新分类列表
          this.triggerEvent('updateCategories', {
            categories: updatedList
          });
        }
      }
    },
    typeIndex: {
      type: Number,
      value: 0
    }
  },
  
  data: {
    categories: []
  },
  
  methods: {
    // 添加全部分类
    addAllCategory: function(typeListData) {
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
    },
    
    // 点击分类
    onCategoryTap: function(e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.data.typeIndex) return;
      
      this.setData({
        typeIndex: index
      });
      
      // 通知父组件更新选中的分类
      this.triggerEvent('switchCategory', {
        index: index,
        category: this.data.categories[index]
      });
    }
  }
}); 