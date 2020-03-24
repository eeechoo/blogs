1. David Beazley
   0. who is him
      - python core developor
      - 我喜欢他讲东西的方式：you can never know it until you make it by yourself & 造轮子的快乐the joy of reinvention
      - 年龄挺大的，国内这个年龄的 computer scientist 太少了
   1. Build Your Own Async 2019
      - video  
        \<Build Your Own Async> youtube
      - code  
        https://gist.github.com/dabeaz/f86ded8d61206c757c5cd4dbb5109f74
      - I also achive the code into \<Build Your Own Async> derectory
      - 相当于 根据 python 的提供的async、await语法，自己造个类似 asyncio 的库来用
    
   2. 
      - Generator Tricks for Systems Programmers (v1.0). Presented at PyCon 2008 (Chicago).
      - A Curious Course on Coroutines and Concurrency. Presented at PyCon 2009 (Chicago).
      - Generators: The Final Frontier. Presented at PyCon 2014 (Montreal).

2. 关于 python 异步编程个人见解  
    csapp 中说过，concurrency 编程分为三类：多进程、单进程多线程、单进程 单线程 IO 复用

    IO 多路复用典型的写法就是 selector.register(event, callback_function)，这种被称为 callback_based 写法，  

    这样的写法存在的问题就是 callback hell 问题，于是大家开动了 聪明的大脑 为解决这个问题造成了各种 syntax sugar，例如：
    - JavaScript 中的 promise 使 <callback 中的嵌套调用> ---进化为--->  <链式调用写法>
    - Python 中使用 async、await <callback 中的嵌套调用>---进化为--->  <阻塞式写法>（这个我们最熟悉，也是最符合人的思维的一种写法，使用最方便的写法）（目前JS也引入了这种写法）


3. 知乎上 python 异步编程的讨论  
https://zhuanlan.zhihu.com/p/45996168