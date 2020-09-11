# 问题： docker 容器 如何 访问宿主机网络

## 问题的起源
考虑这样的场景

container A run a server，which will map its port 80 to host port 80

container B run a database，which will map its port 3306 to host port 3306

container A need container B's data storage service, so container A will need to communicate to container B's port.

抽象出来是：一个 容器 如何 访问另一个 容器

由于 另一个容器 使用了 端口映射，  
所以这个问题也可以抽象为：一个 容器 如何 访问 宿主机 网络

## 解决方案
先放在这里两个链接，将来对 docker 有更加深刻的认识的时候 整理下

https://www.jb51.net/article/149173.htm

https://nyan.im/posts/3981.html




