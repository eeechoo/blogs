# 拥抱变化 
知乎、谷歌等网站很多已经支持 HTTP2 了。  
所以 HTTP2 的研究也应该纳入学习范围了。

HTTP2 有
- Multiplexing（多路复用）
- header compression（头部压缩）
- Server Push（服务器推送）
  服务端推送是一种在客户端请求之前发送数据的机制。在 HTTP/2 中，服务器可以对客户端的一个请求发送多个响应。Server Push 让 HTTP1.x 时代使用内嵌资源的优化手段变得没有意义；如果一个请求是由你的主页发起的，服务器很可能会响应主页内容、logo 以及样式表，因为它知道客户端会用到这些东西。这相当于在一个 HTML 文档内集合了所有的资源，不过与之相比，服务器推送还有一个很大的优势：可以缓存！也让在遵循同源的情况下，不同页面之间可以共享缓存资源成为可能。

# 参考链接

1. 链接：https://www.zhihu.com/question/34074946/answer/75364178  
来源：知乎  
作者：Leo Zhang  

2. https://developer.51cto.com/art/201910/604255.htm

# 展望未来
不仅有 HTTP2，目前还有 HTTP3   
想不到吧，原因嘛，我觉得很有启示性，因为东西是会发展的。  

开始的时候，HTTP 仅仅是用来展示一些HTML文档的，它的基本构想就很简单。  
 
然后就被大家玩坏了，什么 网页APP，网页游戏，网页购物 等等等等。赋予了太多太多想要的功能。然后大家发现，卧槽，当初的HTTP协议设计的实在是太简单了，为了解决一些常见问题，大家都把HTTP给玩坏了，例如：为了实践多个请求回答之间的状态共享问题，实现了cookie技术；为了解决不加密导致的某些人的偷窥欲、控制欲，实现了HTTPS加密技术；为了解决相同资源重复请求问题，实现了缓存技术。

然后怎么办呢，原有的网页功能总不能丢掉不用吧，那用户可要骂娘了。  

只能靠 各种奇技淫巧 + 不断更新的新的标准 + 不断淘汰旧的标准实现。

所以嘛，套用一句哲学话语（♂），要用
> 发展变化的眼光看事务

> 矛盾（需求）与技术总是不断变化的

果然 哲学 才是真正的知识！