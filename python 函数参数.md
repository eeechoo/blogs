# 0. 注意事项
文章中使用 Python 3.7，Python 3.7 和 Python 2.7 在函数参数方面略有差异。 
如无特殊说明，代码默认采用 Python 3.7 解释器。

# 1. 初识 Python 函数参数
为了能够灵活的定义函数接口，Python 函数提供了如下方式定义函数参数。

英文名 | 中文名 | 函数定义 | 函数调用
-------  | ------- | ---------- | ---------
position | 位置参数 | def foo(a) | foo(2)<br>foo(a=2)
keyword | 默认参数 | def foo(a=1) | foo(2)<br>foo(a=2)
var_positional | 可变参数 | def foo(*args) | foo(1, 2, 3)<br>templist = [1, 2, 3]<br>foo(*templist)
keyword_only | 关键字参数 | def foo(*, a)<br>def foo(*, a=1) | foo(a=2) 此处必须使用 **a=**，不可缺省 **a=**
var_keyword | 命名关键字参数 | def foo(**kwargs) | foo(a=2, b=3, c=4)

## 1.1. 练习

* 所有参数都存在的例子

```python
def foo(a, b=1, *args, d, **kwargs):
    print("""a is {}
b is {} 
args is {} {}
d is {}
kwargs is {} {}""".format(a, b, args, type(args), d, kwargs, type(kwargs)))


foo(1, 2, 3, 4, 5, d=6, e=7, f=8)
# 输出结果
# a is 1
# b is 2 
# args is (3, 4, 5) <class 'tuple'>
# d is 6
# kwargs is {'e': 7, 'f': 8} <class 'dict'>
```

* 参数顺序的例子

```python
def foo(a=1, b):
    print(a, b)

foo(1, 2)
# 输出结果
  File "C:/Users/123/PycharmProjects/test123/demo.py", line 1
    def foo(a=1, b):
           ^
SyntaxError: non-default argument follows default argument
```

思考一下，Python 语法为什么不支持这样写。

因为 `def foo(a=1, b, *args):` 这样的写法，  
在函数调用时，`foo(5, 6, 7, 8)` 是被解释为   
`foo(a=1, b=5, args=(6, 7, 8))`   
还是  
 `foo(a=5, b=6, args=(7, 8))`？
这就产生了二义性。

* 只有关键字参数和命名关键字参数  

此时的函数定义比较有意思

```python
def foo(*, a, b, **args):
    print(a, b, args)

foo(a=1, b=2, c=3, d=4)
# 结果输出
# 1 2 {'c': 3, 'd': 4}
```
关键字参数调用时必须指定参数名，在上面的例子中就是必须使用 `a=1, b=2`，参数名不可缺省。

## 1.2. 参考资料
廖雪峰 Python 函数篇  
Fluent Python 函数篇

## 踩过的坑
默认参数的坑，代码如下
```python
def do_something(val, visited=set()):
    visited.add(val) # 注意这个操作 return None
    return visited


a = do_something(1) 
b = do_something(2)
a is b # True
```
以为使用默认参数，调用 do_something 会每次创建一个 新的 set 对象，其实并没有！！！！  
所以重要的话就是：  
不要使用 mutable 对象作为函数的默认参数！！！
不要使用 mutable 对象作为函数的默认参数！！！
不要使用 mutable 对象作为函数的默认参数！！！

《fluent python》 8.4 小节中有对这个默认参数的讲述，很精彩，不再赘述

我踩到这个坑主要是因为 leetcode 133 号问题，我采用了如下代码：
```python
"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = []):
        self.val = val
        self.neighbors = neighbors
"""
class Solution:
    def _dfs(self, cnode, do_something,  visited=set(), **kwargs):
        print(visited)
        if cnode in visited:
            return
        else:
            do_something(cnode, **kwargs)
            visited.add(cnode)
            for inode in cnode.neighbors:
                self._dfs(inode, do_something, visited, **kwargs)


    def cloneGraph(self, node: 'Node') -> 'Node':
        if not node:
            return None

        # 完成 图中 顶点 的复制
        xnode_to_ynode = {}
        def fillmap(cnode, xymap):
            xymap[cnode] = Node(cnode.val)
        self._dfs(node, fillmap, xymap=xnode_to_ynode)

            
        print("next\n\n\n")
        
        #完成 图中 边 的复制
        def fillneighs(cnode, xymap):
            for i in cnode.neighbors:
                xymap[cnode].neighbors.append(xymap[i])
        self._dfs(node, fillneighs, xymap=xnode_to_ynode)

        return xnode_to_ynode[node]
```

## 更多知识
奇怪的知识又增加了 (〃'▽'〃)


## 1.3. Python 2.7 vs. Python 3.7

# 2. 函数参数设计最佳实践
函数参数就是接口设计。  
函数实现一个功能，函数调用者不用关心函数内部逻辑，只需根据函数 API 文档传递符合函数接口的参数即可。  
因此应该如何设计、编写函数接口，方便函数调用者使用呢？

## 2.1. 典型样例

> 操千曲而后晓声，观千剑而后识器。<br> -刘勰《文心雕龙·知音》

来看几个典型的库的函数 API 接口，看看他们是如何设计函数 API 接口的。

## 2.2. 经验总结
