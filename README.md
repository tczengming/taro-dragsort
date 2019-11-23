# taro-dragsort
taro多端开发框架的拖动重排控件

由wx-plugin移植而来，这里特别感谢wx-plugin的作者
目前只支持单列拖动重排，多列功能未实现，要实现也不难，当列改变时通过redux通知drag控件columns已经改变，让drag控件重新调用init()一次

<pre>
src/
├── components
│   └── drag // 控件
│       ├── index.js
│       └── index.scss
└── pages
    └── drag // 此page中会用到drag控件
        ├── index.js
        └── index.scss
        
如果一个页面中同时使用到多个drag拖动排序组件，则需要显示设定外框高度显示传入height到style中，或者在scss中设定高度值也行
</pre>

工程太大，故只上传关键的几个文件，如果要测试可拷贝上面文件到taro工程中相对应的目录下，然后跳转到'/pages/drag/index'页面就可。
