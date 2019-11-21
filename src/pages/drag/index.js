import { Block, View, Text, Slider } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Drag from '../../components/drag/index'

import './index.scss'

export default class DragPage extends Taro.Component {
  state={
    isIphoneX: false,
    size: 1,
    listData : [
      {
        title: '1.这个绝望的世界没有存在的价值，所剩的只有痛楚',
        description:
          '思念、愿望什么的都是一场空，被这种虚幻的东西绊住脚，什么都做不到',
        //images: '../../assets/image/swipe/1.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '2.我早已闭上了双眼，我的目的，只有在黑暗中才能实现',
        description:
          '有太多的羁绊只会让自己迷惘，强烈的想法和珍惜的思念，只会让自己变弱',
        //images: '../../assets/image/swipe/2.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title:
          '3.感受痛苦吧，体验痛苦吧，接受痛苦吧，了解痛苦吧。不知道痛苦的人是不会知道什么是和平',
        description:
          '但我已经在无限存在的痛苦之中，有了超越凡人的成长。从凡人化为神',
        //images: '../../assets/image/swipe/3.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title:
          '4.我决定了 从今天起 我要选择一条不会让自己后悔的路 我要创造出属于自己的忍道 ',
        description:
          '我才不要在这种时候放弃,即使当不成中忍,我也会通过其他的途径成为火影的,这就是我的忍道',
        //images: '../../assets/image/swipe/4.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '5.为什么你会这么弱？就是因为你对我的仇恨...还不够深...',
        description:
          '你没有杀的价值...愚蠢的弟弟啊...想要杀死我的话...仇恨吧！憎恨吧！然后丑陋地活下去吧！逃吧 逃吧...然后苟且偷生下去吧！',
        //images: '../../assets/image/swipe/5.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '6.对于忍者而言怎样活着无所谓，怎样死去才是最重要的...',
        description:
          '所谓的忍者就是忍人所不能忍，忍受不了饿肚子，而沦落为盗贼的人，根本不能称之为忍者',
        //images: '../../assets/image/swipe/6.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '7.在这世上，有光的地方就必定有黑暗，所谓的胜者，也就是相对败者而言',
        description:
          '若以一己之思念要维持和平，必会招致战争，为了守护爱，变回孕育出恨。此间因果，是无法斩断的。现实就是如此',
        //images: '../../assets/image/swipe/7.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '8.世界上...只有没有实力的人,才整天希望别人赞赏...',
        description:
          '很不巧的是我只有一个人，你说的那些家伙们已经一个都没有了，已经??全部被杀死了',
        //images: '../../assets/image/swipe/8.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '9.千代婆婆，父亲大人和母亲大人回来了吗？？？',
        description:
          '明明剩下的只有痛苦了，既然你这么想活命，我就方你一条生路好了。不过，你中的毒不出三日就会要了你的命',
        //images: '../../assets/image/swipe/9.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      },
      {
        title: '10.艺术就是爆炸！！~~ 嗯 ~~ 芸术は爆発します！',
        description:
          '我的艺术就是爆炸那一瞬，和蝎那种让人吃惊的人偶喜剧从根本上就是不同的！',
        //images: '../../assets/image/swipe/10.png',
        images: 'http://www.qqtouxiang.com/d/file/tupian/mx/20170918/jixcmavsyr2dh.jpg',
        fixed: false
      }
    ],
  }

  itemClick(oldKey, newKey, data) {
    console.log('itemClick')
  }

  change(listData) {
    console.log('change ', listData)
    this.setState({
      listData: listData
    })
  }

  toggleFixed(e) {
    console.log('toggleFixed, 未实现')
    let key = e.currentTarget.dataset.key

    let listData = this.state.listData

    listData[key].fixed = !listData[key].fixed

    this.setState({
      listData: listData
    })

    // TODO 未实现， Drag要重新调用init()才会生效
  }

  sizeChange() {
    console.log('sizeChange, 未实现')
  }

  render() {
    const { size, listData, isIphoneX } = this.state
    return (
      <Block>
        <View className='tip'>
          <Text style='color: red;'>长按触发拖拽排序!!</Text>
          <Text style='color: #3F82FD;'>
            最新版本增加顶部固定区域高度和底部固定区域高度,
            以响应超过一屏时候可以正确滑动
          </Text>
        </View>
        <Drag
          onItemClick={this.itemClick.bind(this)}
          columns={size}
          listData={listData}
          topSize={110}
          bottomSize={isIphoneX ? 380 : 300}
          onChange={this.change.bind(this)}
        ></Drag>
        <View className={'empty-bottom ' + (isIphoneX ? 'isX' : '')}></View>
        <View className={'control-panel ' + (isIphoneX ? 'isX' : '')}>
          <View className='panel-item'>
            <View className='panel-item__hd'>请选择需要固定住的item:</View>
          </View>
          <View>
            {listData.map((item, index) => {
              return (
                <View
                  key={index}
                  onTap={this.toggleFixed.bind(this)}
                  data-key={index}
                  className='circle-wrap'
                >
                  {item.fixed ? (
                    <View className='circle cur'>✓</View>
                  ) : (
                    <View className='circle'></View>
                  )}
                  <View>{index}</View>
                </View>
              )
            })}
          </View>
          <View className='panel-item'>
            <View className='panel-item__hd'>columns:</View>
            <View className='panel-item__bd'>
              <Slider
                onChanging={this.sizeChange.bind(this)}
                value={size}
                showValue
                min='1'
                max='8'
                step='1'
              ></Slider>
            </View>
          </View>
        </View>
      </Block>
    )
  }
}