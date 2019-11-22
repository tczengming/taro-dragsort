import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
//import classNames from 'classnames'

import './index.scss'

export default class Drag extends Taro.Component {
  constructor(props) {
    super(props)

    this.data = {
      itemDom: {
        // 每一项 item 的 dom 信息, 由于大小一样所以只存储一个
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      preOriginKey: -1, // 前一次排序时候的起始 key 值
    }

    this.state = {
      /* 渲染数据 */
      windowHeight: 0, // 视窗高度
      platform: '', // 平台信息
      realTopSize: 0, // 计算后顶部高度实际值
      realBottomSize: 0, // 计算后底部高度实际值
      itemWrapDom: {
        // 整个拖拽区域的 dom 信息
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      startTouch: {
        // 初始触摸点信息
        pageX: 0,
        pageY: 0,
        identifier: 0
      },
      startTranX: 0, // 当前激活元素的初始 X轴 偏移量
      startTranY: 0, // 当前激活元素的初始 Y轴 偏移量

      /* 未渲染数据 */
      list: [],
      cur: -1, // 当前激活的元素
      curZ: -1, // 当前激活的元素, 用于控制激活元素z轴显示
      tranX: 0, // 当前激活元素的 X轴 偏移量
      tranY: 0, // 当前激活元素的 Y轴 偏移量
      itemWrapHeight: 0, // 动态计算父级元素高度
      dragging: false, // 是否在拖拽中
      overOnePage: false, // 整个区域是否超过一个屏幕
      itemTransition: false, // item 变换是否需要过渡动画, 首次渲染不需要
      listDataChanged: true, // 第一次渲染需调用init()一次, 以便计算item显示位置
    }

    this.init()
  }

  /**
   * 点击每一项后触发事件
   */
  itemClick(e) {
    let { index } = e.currentTarget.dataset
    let item = this.state.list[index]
    this.props.onItemClick(index, item.key, item.data)
    //this.triggerEvent('click', {
      //oldKey: index,
      //newKey: item.key,
      //data: item.data
    //})
  }
  /**
   * 长按触发移动排序
   */
  longPress(e) {
    // 获取触摸点信息
    let startTouch = e.changedTouches[0]
    if (!startTouch) {
      console.log('longPress !startTouch')
      return
    }

    console.log('longPress')

    // 如果是固定项则返回
    let index = e.currentTarget.dataset.index
    if (this.isFixed(index)) return

    // 防止多指触发 drag 动作, 如果已经在 drag 中则返回, touchstart 事件中有效果
    if (this.state.dragging) return
    this.setState({ dragging: true })

    let itemDom = this.data.itemDom
    let { pageX: startPageX, pageY: startPageY } = startTouch,
      { itemWrapDom } = this.state,
      startTranX = 0,
      startTranY = 0

    if (this.props.columns > 1) {
      // 多列的时候计算X轴初始位移, 使 item 水平中心移动到点击处
      startTranX = startPageX - itemDom.width / 2 - itemWrapDom.left
    }
    // 计算Y轴初始位移, 使 item 垂直中心移动到点击处
    startTranY = startPageY - itemDom.height / 2 - itemWrapDom.top

    this.setState({
      startTouch: startTouch,
      startTranX: startTranX,
      startTranY: startTranY,
      cur: index,
      curZ: index,
      tranX: startTranX,
      tranY: startTranY
    })
    Taro.vibrateShort()
  }

  touchMove(e) {
    // 获取触摸点信息
    let currentTouch = e.changedTouches[0]
    if (!currentTouch) {
      console.log('touchMove !curentTouch')
      return
    }

    if (!this.state.dragging) {
      console.log('touchMove !dragging')
      return
    }

    console.log('touchMove overOnePage', this.state.overOnePage)

    let { preOriginKey, itemDom } = this.data
        
    let {
        windowHeight,
        realTopSize,
        realBottomSize,
        startTouch,
        startTranX,
        startTranY,
      } = this.state,
      {
        pageX: startPageX,
        pageY: startPageY,
        identifier: startId
      } = startTouch,
      {
        pageX: currentPageX,
        pageY: currentPageY,
        identifier: currentId,
        clientY: currentClientY
      } = currentTouch

    // 如果不是同一个触发点则返回
    if (startId !== currentId) {
      console.log('startId != currentId')
      return
    }

    // 通过 当前坐标点, 初始坐标点, 初始偏移量 来计算当前偏移量
    let tranX = currentPageX - startPageX + startTranX,
      tranY = currentPageY - startPageY + startTranY

    // 单列时候X轴初始不做位移
    if (this.props.columns === 1) tranX = 0

    // 判断是否超过一屏幕, 超过则需要判断当前位置动态滚动page的位置
    if (this.state.overOnePage) {
      if (currentClientY > windowHeight - itemDom.height - realBottomSize) {
        // 当前触摸点pageY + item高度 - (屏幕高度 - 底部固定区域高度)
        Taro.pageScrollTo({
          scrollTop:
            currentPageY + itemDom.height - (windowHeight - realBottomSize),
          duration: 300
        })
      } else if (currentClientY < itemDom.height + realTopSize) {
        // 当前触摸点pageY - item高度 - 顶部固定区域高度
        Taro.pageScrollTo({
          scrollTop: currentPageY - itemDom.height - realTopSize,
          duration: 300
        })
      }
    }

    // 设置当前激活元素偏移量
    this.setState({
      tranX: tranX,
      tranY: tranY
    })

    // 获取 originKey 和 endKey
    let originKey = parseInt(e.currentTarget.dataset.key),
      endKey = this.calculateMoving(tranX, tranY)

    // 如果是固定 item 则 return
    if (this.isFixed(endKey)) return

    // 防止拖拽过程中发生乱序问题
    if (originKey === endKey || preOriginKey === originKey) {
      //console.log('防止发生乱序')
      return
    }

    this.data.preOriginKey = originKey

    // 触发排序
    this.insert(originKey, endKey)
  }

  touchEnd() {
    console.log('touchEnd dragging:', this.state.dragging)
    if (!this.state.dragging) return
    this.clearData()
  }

  /**
   * 根据当前的手指偏移量计算目标key
   */
  calculateMoving(tranX, tranY) {
    console.log('calculateMoving')
    let { itemDom } = this.data

    let rows = Math.ceil(this.state.list.length / this.props.columns) - 1,
      i = Math.round(tranX / itemDom.width),
      j = Math.round(tranY / itemDom.height)

    i = i > this.props.columns - 1 ? this.props.columns - 1 : i
    i = i < 0 ? 0 : i
    j = j < 0 ? 0 : j
    j = j > rows ? rows : j

    let endKey = i + this.props.columns * j
    endKey =
      endKey >= this.state.list.length ? this.state.list.length - 1 : endKey

    return endKey
  }

  /**
   * 根据起始key和目标key去重新计算每一项的新的key
   */
  insert(origin, end) {
    console.log('insert')
    this.setState({ itemTransition: true })
    let list
    if (origin < end) {
      // 正序拖动
      list = this.state.list.map(item => {
        if (item.fixed) return item
        if (item.key > origin && item.key <= end) {
          item.key = this.l2r(item.key - 1, origin)
        } else if (item.key === origin) {
          item.key = end
        }
        return item
      })
      this.getPosition(list)
    } else if (origin > end) {
      // 倒序拖动
      list = this.state.list.map(item => {
        if (item.fixed) return item
        if (item.key >= end && item.key < origin) {
          item.key = this.r2l(item.key + 1, origin)
        } else if (item.key === origin) {
          item.key = end
        }
        return item
      })
      this.getPosition(list)
    }
  }

  /**
   * 正序拖动 key 值和固定项判断逻辑
   */
  l2r(key, origin) {
    if (key === origin) return origin
    if (this.state.list[key].fixed) {
      return this.l2r(key - 1, origin)
    } else {
      return key
    }
  }

  /**
   * 倒序拖动 key 值和固定项判断逻辑
   */
  r2l(key, origin) {
    if (key === origin) return origin
    if (this.state.list[key].fixed) {
      return this.r2l(key + 1, origin)
    } else {
      return key
    }
  }

  /**
   * 根据排序后 list 数据进行位移计算
   */
  getPosition(data, vibrate = true) {
    let itemDom = this.data.itemDom
    let { platform } = this.state
    console.log('getPosition', 'itemDom.height', itemDom.height)

    let list = data.map((item, index) => {
      item.tranX = itemDom.width * (item.key % this.props.columns)
      item.tranY = Math.floor(item.key / this.props.columns) * itemDom.height
      return item
    })
    this.setState({ list: list })

    if (!vibrate) {
      console.log('!vibrate')
      return
    }
    if (platform !== 'devtools') Taro.vibrateShort()
    let listData = []
    list.forEach(item => {
      listData[item.key] = item.data
    })
    console.log('this.props.onChange:', listData)
    //this.props.onChange(listData) // TODO
    this.setState({
      listDataChanged: true
    })
    //this.triggerEvent('change', { listData: listData })
  }

  /**
   * 判断是否是固定的 item
   */
  isFixed(key) {
    let list = this.state.list
    if (list && list[key] && list[key].fixed) return 1
    return 0
  }

  /**
   * 清除参数
   */
  clearData() {
    console.log('clearData')

    this.data.preOriginKey= -1
    this.setState({
      dragging: false,
      cur: -1,
      tranX: 0,
      tranY: 0
    })
    // 延迟清空
    setTimeout(() => {
      this.setState({
        curZ: -1
      })
    }, 300)
  }

  /**
   *  初始化获取 dom 信息
   */
  initDom() {
    const bottomSize = this.props.bottomSize
    Taro.pageScrollTo({ scrollTop: 0, duration: 0 })
    let { windowWidth, windowHeight, platform } = Taro.getSystemInfoSync()
    let remScale = (windowWidth || 375) / 375,
      realTopSize = (this.props.topSize * remScale) / 2,
      realBottomSize = (bottomSize * remScale) / 2

    console.log('initDom', 'windowWidth', windowWidth, 'remScale', remScale, 'bottomSize', bottomSize)

    this.setState({
      windowHeight: windowHeight,
      platform: platform,
      realTopSize: realTopSize,
      realBottomSize: realBottomSize
    })

    Taro.createSelectorQuery().in(this.$scope)
      .select('.item')
      .boundingClientRect(res => {
        console.log('item res', res)
        if (res) {
          let rows = Math.ceil(this.state.list.length / this.props.columns)
          this.data.itemDom=res
          console.log('initDom rows:',  rows, 'res.height', res.height, 'itemWrapHeight:', rows * res.height, 'data.itemDom.height', this.data.itemDom.height)
          this.setState({
            itemWrapHeight: rows * res.height
          })

          this.getPosition(this.state.list, false)

          Taro.createSelectorQuery().in(this.$scope)
            .select('.item-wrap')
            .boundingClientRect(wres => {
              //console.log('item-wrap res', res)
              if (wres) {
                // (列表的底部到页面顶部距离 > 屏幕高度 - 底部固定区域高度) 用该公式来计算是否超过一页
                let overOnePage = wres.bottom > windowHeight - realBottomSize

                console.log('overOnePage:', overOnePage, 'res.bottom', wres.bottom, 'windowHeight', windowHeight, 'realBottomSize', realBottomSize)
                this.setState({
                  itemWrapDom: wres,
                  overOnePage: overOnePage
                })
              }
            })
            .exec()
        }
      })
      .exec()
  }

  /**
   *  初始化
   */
  init() {
    console.log('init')
    const listData = this.props.listData
    this.setState({
      listDataChanged: false,
    })
    this.clearData()
    // 避免获取不到节点信息报错问题
    if (listData.length === 0) {
      this.setState({ list: [] })
      return
    }
    // 遍历数据源增加扩展项, 以用作排序使用
    let list = listData.map((item, index) => {
      return {
        fixed: item.fixed,
        key: index,
        tranX: 0,
        tranY: 0,
        data: item
      }
    })
    this.setState({
      list: list,
      itemTransition: false
    })
    // 异步加载数据时候, 延迟执行 initDom 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
    setTimeout(() => this.initDom(), 10)
  }

  render() {
    //if (this.state.listDataChanged) {
      //this.init()
    //}

    const columns = this.props.columns

    const {
      overOnePage,
      itemWrapHeight,
      cur,
      curZ,
      itemTransition,
      tranX,
      tranY,
      dragging,
      list
    } = this.state

    console.log('len', list.length, 'render list:', list)

    return (
      <View>
        <View style={'overflow-x: ' + (overOnePage ? 'hidden' : 'initial')}>
          <View
            className='item-wrap'
            style={'height: ' + itemWrapHeight + 'px;'}
          >
            {list.map((item, index) => {
              return (
                <View
                  className={
                    'item ' +
                    (cur == index ? 'cur' : '') +
                    ' ' +
                    (curZ == index ? 'zIndex' : '') +
                    ' ' +
                    (itemTransition && index !== cur ? 'itemTransition' : '') +
                    ' ' +
                    (item.fixed ? 'fixed' : '')
                  }
                  key={index}
                  id={'item' + index}
                  data-key={item.key}
                  data-index={index}
                  style={
                    'transform: translate3d(' +
                    (index === cur ? tranX : item.tranX) +
                    'px, ' +
                    (index === cur ? tranY : item.tranY) +
                    'px, 0px);width: ' +
                    100 / columns +
                    '%'
                  }
                  onClick={this.itemClick.bind(this)}
                  onLongpress={this.longPress.bind(this)}
                  onTouchmove={this.touchMove.bind(this)}
                  onTouchend={this.touchEnd.bind(this)}
                >
                  {columns >= 2 ? (
                    <View className='info'>
                      <View className='info__item'>
                        <Image className='image' src={item.data.images}></Image>
                      </View>
                    </View>
                  ) : (
                    <View className='cell'>
                      <View className='cell__hd'>
                        <Image
                          className='image'
                          mode='aspectFill'
                          src={item.data.images}
                          alt
                        ></Image>
                      </View>
                      <View className='cell__bd'>
                        <View className='name'>{item.data.title}</View>
                        <View className='des'>{item.data.description}</View>
                      </View>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      </View>
    )
  }
}

Drag.defaultProps = {
    listData: [],
    // 列数
    columns: 1,
    // 顶部高度
    topSize: 0,
    // 底部高度
    bottomSize: 0,
    onChange: () =>{},
    onItemClick: () => {},
}

Drag.propTypes = {
  listData: PropTypes.array,
  columns: PropTypes.number,
  topSize: PropTypes.number,
  bottomSize: PropTypes.number,
  onChange: PropTypes.func, 
  onItemClick: PropTypes.func,
}
