# 启示
写文章就应该像这个人写的一样，简单易懂，充满逻辑

# 问题核心
TCP是面向流的，所以在应用层会出现拆包和粘包问题。

粘包与拆包是由于TCP协议是字节流协议，没有记录边界所导致的。  
所以如何确定一个完整的业务包就由应用层来处理了。  
（这就是分包机制，本质上就是要在应用层维护消息与消息的边界。）  
分包机制一般有两个通用的解决方法：  
1. 特殊字符控制，例如FTP协议。  
2. 在包头首都添加数据包的长度，例如HTTP协议。

作者：祖春雷
链接：https://www.zhihu.com/question/37023914/answer/140363746
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


# 代码演示
<h3>简介</h3>

<p>拆包和粘包是在socket编程中经常出现的情况，在socket通讯过程中，如果通讯的一端一次性连续发送多条数据包，tcp协议会将多个数据包打包成一个tcp报文发送出去，这就是所谓的<b>粘包</b>。而如果通讯的一端发送的数据包超过一次tcp报文所能传输的最大值时，就会将一个数据包拆成多个最大tcp长度的tcp报文分开传输，这就叫做<b>拆包</b>。
</p>

<h3>一些基本概念</h3>

<h3>MTU</h3>
<p>泛指通讯协议中的最大传输单元。一般用来说明TCP/IP四层协议中数据链路层的最大传输单元，不同类型的网络MTU也会不同，我们普遍使用的以太网的MTU是1500，即最大只能传输1500字节的数据帧。可以通过ifconfig命令查看电脑各个网卡的MTU。
</p>

<h3>MSS</h3>
<p>指TCP建立连接后双方约定的可传输的最大TCP报文长度，是TCP用来限制应用层可发送的最大字节数。如果底层的MTU是1500byte，则 MSS = 1500- 20(IP Header) -20 (TCP Header) =
    1460 byte。</p>

<h3>示意图</h3>
<p>如图所示，客户端和服务端之间的通道代表TCP的传输通道，两个箭头之间的方块代表一个TCP数据包，正常情况下一个TCP包传输一个应用数据。粘包时，两个或多个应用数据包被粘合在一起通过一个TCP传输。而拆包情况下，会一个应用数据包会被拆成两段分开传输，其他的一段可能会和其他应用数据包粘合。
</p>
<p class="ztext-empty-paragraph"><br></p>
<figure data-size="normal"><img src="https://pic4.zhimg.com/v2-5489aee8a9402ace1bed27add920d44b_b.jpg" data-caption=""
        data-size="normal" data-rawwidth="1158" data-rawheight="1056" class="origin_image zh-lightbox-thumb"
        width="1158" data-original="https://pic4.zhimg.com/v2-5489aee8a9402ace1bed27add920d44b_r.jpg"></figure>
<p class="ztext-empty-paragraph"><br></p>
<h3>场景实例</h3>
<p>下面通过简单实现两个socket端通讯，演示粘包和拆包的流程。客户端和服务端都在本机进行通讯，服务端使用127.0.0.1监听客户端，客户端也在127.0.0.1发起连接。</p>
<h3>1. 粘包</h3>
<blockquote> a. 实现服务端代码，服务监听55533端口，没有指定IP地址默认就是localhost，即本机IP环回地址 127.0.0.1，接着就等待客户端连接，代码如下：<br> </blockquote>
<div class="highlight">
    <pre><code class="language-java"><span class="kd">public</span> <span class="kd">class</span> <span class="nc">SocketServer</span> <span class="o">{</span>
    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">main</span><span class="o">(</span><span class="n">String</span><span class="o">[]</span> <span class="n">args</span><span class="o">)</span> <span class="kd">throws</span> <span class="n">Exception</span> <span class="o">{</span>
        <span class="c1">// 监听指定的端口
</span><span class="c1"></span>        <span class="kt">int</span> <span class="n">port</span> <span class="o">=</span> <span class="n">55533</span><span class="o">;</span>
        <span class="n">ServerSocket</span> <span class="n">server</span> <span class="o">=</span> <span class="k">new</span> <span class="n">ServerSocket</span><span class="o">(</span><span class="n">port</span><span class="o">);</span>

        <span class="c1">// server将一直等待连接的到来
</span><span class="c1"></span>        <span class="n">System</span><span class="o">.</span><span class="na">out</span><span class="o">.</span><span class="na">println</span><span class="o">(</span><span class="s">"server将一直等待连接的到来"</span><span class="o">);</span>
        <span class="n">Socket</span> <span class="n">socket</span> <span class="o">=</span> <span class="n">server</span><span class="o">.</span><span class="na">accept</span><span class="o">();</span>
        <span class="c1">// 建立好连接后，从socket中获取输入流，并建立缓冲区进行读取
</span><span class="c1"></span>        <span class="n">InputStream</span> <span class="n">inputStream</span> <span class="o">=</span> <span class="n">socket</span><span class="o">.</span><span class="na">getInputStream</span><span class="o">();</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">bytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">1024</span> <span class="o">*</span> <span class="n">1024</span><span class="o">];</span>
        <span class="kt">int</span> <span class="n">len</span><span class="o">;</span>
        <span class="k">while</span> <span class="o">((</span><span class="n">len</span> <span class="o">=</span> <span class="n">inputStream</span><span class="o">.</span><span class="na">read</span><span class="o">(</span><span class="n">bytes</span><span class="o">))</span> <span class="o">!=</span> <span class="o">-</span><span class="n">1</span><span class="o">)</span> <span class="o">{</span>
            <span class="c1">//注意指定编码格式，发送方和接收方一定要统一，建议使用UTF-8
</span><span class="c1"></span>            <span class="n">String</span> <span class="n">content</span> <span class="o">=</span> <span class="k">new</span> <span class="n">String</span><span class="o">(</span><span class="n">bytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">len</span><span class="o">,</span><span class="s">"UTF-8"</span><span class="o">);</span>
            <span class="n">System</span><span class="o">.</span><span class="na">out</span><span class="o">.</span><span class="na">println</span><span class="o">(</span><span class="s">"len = "</span> <span class="o">+</span> <span class="n">len</span> <span class="o">+</span> <span class="s">", content: "</span> <span class="o">+</span> <span class="n">content</span><span class="o">);</span>
        <span class="o">}</span>
        <span class="n">inputStream</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">socket</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">server</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
    <span class="o">}</span>
<span class="o">}</span></code></pre>
</div>
<blockquote> b. 实现客户端代码，连接服务端，两端连接建立后，客户端就连续发送100个同样的字符串；<br> </blockquote>
<div class="highlight">
    <pre><code class="language-java"><span class="kd">public</span> <span class="kd">class</span> <span class="nc">SocketClient</span> <span class="o">{</span>
    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">main</span><span class="o">(</span><span class="n">String</span><span class="o">[]</span> <span class="n">args</span><span class="o">)</span> <span class="kd">throws</span> <span class="n">Exception</span> <span class="o">{</span>
        <span class="c1">// 要连接的服务端IP地址和端口
</span><span class="c1"></span>        <span class="n">String</span> <span class="n">host</span> <span class="o">=</span> <span class="s">"127.0.0.1"</span><span class="o">;</span>
        <span class="kt">int</span> <span class="n">port</span> <span class="o">=</span> <span class="n">55533</span><span class="o">;</span>
        <span class="c1">// 与服务端建立连接
</span><span class="c1"></span>        <span class="n">Socket</span> <span class="n">socket</span> <span class="o">=</span> <span class="k">new</span> <span class="n">Socket</span><span class="o">(</span><span class="n">host</span><span class="o">,</span> <span class="n">port</span><span class="o">);</span>
        <span class="c1">// 建立连接后获得输出流
</span><span class="c1"></span>        <span class="n">OutputStream</span> <span class="n">outputStream</span> <span class="o">=</span> <span class="n">socket</span><span class="o">.</span><span class="na">getOutputStream</span><span class="o">();</span>
        <span class="n">String</span> <span class="n">message</span> <span class="o">=</span> <span class="s">"这是一个整包!!!"</span><span class="o">;</span>
        <span class="k">for</span> <span class="o">(</span><span class="kt">int</span> <span class="n">i</span> <span class="o">=</span> <span class="n">0</span><span class="o">;</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="n">1</span><span class="o">;</span> <span class="n">i</span><span class="o">++)</span> <span class="o">{</span>
            <span class="c1">//Thread.sleep(1);
</span><span class="c1"></span>            <span class="n">outputStream</span><span class="o">.</span><span class="na">write</span><span class="o">(</span><span class="n">message</span><span class="o">.</span><span class="na">getBytes</span><span class="o">(</span><span class="s">"UTF-8"</span><span class="o">));</span>
        <span class="o">}</span>
        <span class="n">Thread</span><span class="o">.</span><span class="na">sleep</span><span class="o">(</span><span class="n">20000</span><span class="o">);</span>
        <span class="n">outputStream</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">socket</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
    <span class="o">}</span>
<span class="o">}</span></code></pre>
</div>
<blockquote> c. 先运行服务端代码，运行到server.accept()时阻塞，打印“server将一直等待连接的到来”来等待客户端的连接，接着再运行客户端代码；<br> d.
    客户端代码运行后，就能看到服务端的控制台打印结果如下：<br> </blockquote>
<div class="highlight">
    <pre><code class="language-text">server将一直等待连接的到来
len = 21, content: 这是一个整包!!!
len = 168, content: 这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!
len = 105, content: 这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!
len = 42, content: 这是一个整包!!!这是一个整包!!!
len = 42, content: 这是一个整包!!!这是一个整包!!!
len = 63, content: 这是一个整包!!!这是一个整包!!!这是一个整包!!!
len = 42, content: 这是一个整包!!!这是一个整包!!!
len = 21, content: 这是一个整包!!!
len = 42, content: 这是一个整包!!!这是一个整包!!!
len = 21, content: 这是一个整包!!!
len = 147, content: 这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!
len = 63, content: 这是一个整包!!!这是一个整包!!!这是一个整包!!!
len = 21, content: 这是一个整包!!!
len = 252, content: 这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!这是一个整包!!!</code></pre>
</div>
<p>按照原来的理解，在客户端每次发送一段字符串“这是一个整包!!!”, 分别发送了50次。服务端应该也会是分50次接收，会打印50行同样的字符串。但结果却是这样不寻常的结果，这就是由于粘包导致的结果。</p>
<p><b>总结出现粘包的原因</b>：</p>
<ol>
    <li>要发送的数据小于TCP发送缓冲区的大小，TCP将多次写入缓冲区的数据一次发送出去；</li>
    <li>接收数据端的应用层没有及时读取接收缓冲区中的数据；</li>
    <li>数据发送过快，数据包堆积导致缓冲区积压多个数据后才一次性发送出去(如果客户端每发送一条数据就睡眠一段时间就不会发生粘包)；</li>
</ol>
<h3>2. 拆包</h3>
<p>如果数据包太大，超过MSS的大小，就会被拆包成多个TCP报文分开传输。所以要演示拆包的情况，就需要发送一个超过MSS大小的数据，而MSS的大小是多少呢，就要看数据所经过网络的MTU大小。由于上面socket中的客户端和服务端IP都是127.0.0.1,
    数据只在回环网卡间进行传输，所以客户端和服务端的MSS都为回环网卡的 MTU - 20(IP Header) -20 (TCP Header)，沿用粘包的例子，下面是拆包的处理步骤。</p>
<blockquote> a. mac电脑可以通过ifconfig查看本地的各个网卡的MTU，以下我的电脑运行ifconfig后输出的一部分，其中lo0就是回环网卡，可看出mtu是16384：<br> </blockquote>
<div class="highlight">
    <pre><code class="language-text">lo0: flags=8049&lt;UP,LOOPBACK,RUNNING,MULTICAST&gt; mtu 16384
    options=1203&lt;RXCSUM,TXCSUM,TXSTATUS,SW_TIMESTAMP&gt;
    inet 127.0.0.1 netmask 0xff000000
    inet6 ::1 prefixlen 128
    inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1
    nd6 options=201&lt;PERFORMNUD,DAD&gt;
en0: flags=8863&lt;UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST&gt; mtu 1500
    ether 88:e9:fe:76:dc:57
    inet6 fe80::18d4:84fb:fa10:7f8%en0 prefixlen 64 secured scopeid 0x6
    inet 192.168.1.8 netmask 0xffffff00 broadcast 192.168.1.255
    inet6 240e:d2:495f:9700:182a:c53f:c720:5f63 prefixlen 64 autoconf secured
    inet6 240e:d2:495f:9700:d96:48f2:8108:2b33 prefixlen 64 autoconf temporary
    nd6 options=201&lt;PERFORMNUD,DAD&gt;
    media: autoselect
    status: active
en1: flags=8963&lt;UP,BROADCAST,SMART,RUNNING,PROMISC,SIMPLEX,MULTICAST&gt; mtu 1500
    options=60&lt;TSO4,TSO6&gt;
    ether 7a:00:5c:40:cf:01
    media: autoselect &lt;full-duplex&gt;
    status: inactive
en2: flags=8963&lt;UP,BROADCAST,SMART,RUNNING,PROMISC,SIMPLEX,MULTICAST&gt; mtu 1500
    options=60&lt;TSO4,TSO6&gt;
    ether 7a:00:5c:40:cf:00
    media: autoselect &lt;full-duplex&gt;
    status: inactive
......</code></pre>
</div>
<blockquote> b.
    服务端代码和粘包时一样，将客户端代码改为发送一个超过16384字节的字符串，假设使用UTF-8编码的中文字符一个文字3个字节，那么就需要发送一个大约5461字的字符串，TCP才会拆包，为了篇幅不会太长，发送的字符串我只用一小段文字代替。客户端代码如下：<br>
</blockquote>
<div class="highlight">
    <pre><code class="language-java"><span class="kd">public</span> <span class="kd">class</span> <span class="nc">SocketClient</span> <span class="o">{</span>

    <span class="kd">private</span> <span class="kd">final</span> <span class="kd">static</span> <span class="n">String</span> <span class="n">CONTENT</span> <span class="o">=</span> <span class="s">"这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很.....长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串"</span><span class="o">;</span><span class="c1">//测试时大于5461文字，由于篇幅所限，只用这一段作为代表
</span><span class="c1"></span>
    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">main</span><span class="o">(</span><span class="n">String</span><span class="o">[]</span> <span class="n">args</span><span class="o">)</span> <span class="kd">throws</span> <span class="n">Exception</span> <span class="o">{</span>
        <span class="c1">// 要连接的服务端IP地址和端口
</span><span class="c1"></span>        <span class="n">String</span> <span class="n">host</span> <span class="o">=</span> <span class="s">"127.0.0.1"</span><span class="o">;</span>
        <span class="kt">int</span> <span class="n">port</span> <span class="o">=</span> <span class="n">55533</span><span class="o">;</span>
        <span class="c1">// 与服务端建立连接
</span><span class="c1"></span>        <span class="n">Socket</span> <span class="n">socket</span> <span class="o">=</span> <span class="k">new</span> <span class="n">Socket</span><span class="o">(</span><span class="n">host</span><span class="o">,</span> <span class="n">port</span><span class="o">);</span>
        <span class="c1">// 建立连接后获得输出流
</span><span class="c1"></span>        <span class="n">OutputStream</span> <span class="n">outputStream</span> <span class="o">=</span> <span class="n">socket</span><span class="o">.</span><span class="na">getOutputStream</span><span class="o">();</span>
        <span class="n">String</span> <span class="n">message</span> <span class="o">=</span> <span class="s">"这是一个整包!!!"</span><span class="o">;</span>
        <span class="k">for</span> <span class="o">(</span><span class="kt">int</span> <span class="n">i</span> <span class="o">=</span> <span class="n">0</span><span class="o">;</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="n">1</span><span class="o">;</span> <span class="n">i</span><span class="o">++)</span> <span class="o">{</span>
            <span class="n">outputStream</span><span class="o">.</span><span class="na">write</span><span class="o">(</span><span class="n">message</span><span class="o">.</span><span class="na">getBytes</span><span class="o">(</span><span class="s">"UTF-8"</span><span class="o">));</span>
        <span class="o">}</span>
        <span class="n">Thread</span><span class="o">.</span><span class="na">sleep</span><span class="o">(</span><span class="n">20000</span><span class="o">);</span>
        <span class="n">outputStream</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">socket</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
    <span class="o">}</span>
<span class="o">}</span></code></pre>
</div>
<blockquote> c. 和粘包的代码示例一样，先运行原来的的服务端代码，接着运行客户端代码，看服务端的打印输出。<br> </blockquote>
<div class="highlight">
    <pre><code class="language-text">server将一直等待连接的到来
len = 22328, content: 这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很.....长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串这是一个很长很长的字符串...(有22328字节数组的文字)</code></pre>
</div>
<p>通过输出的log，可发现客户端发送的字符串并没有在服务端被拆开，而是一次读取了客户端发送的完整字符串。是不是就没有被拆包呢，其实不是的，这是因为字符串被分拆成两个TCP报文，发送到了服务端的缓冲数据流中，服务端一次性读取了流中的数据，显示的结果就是两个tcp数据报串接在一起了。我们可以通过tcpdump抓包查看数据的传送细节：
</p>
<p>在控制台输入sudo tcpdump -i lo0 'port
    55533'，作用是监听回环网卡lo0上在55533端口传输的数据包，有从这个端口出入的数据包都会被抓获并打印出来，这个命令需要管理员权限，输入用户密码后，开始监听数据。这时我们按照刚才的测试步骤重新运行一遍，抓包的结果如下：
</p>
<div class="highlight">
    <pre><code class="language-text">tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on lo0, link-type NULL (BSD loopback), capture size 262144 bytes
23:15:44.641208 IP 192.168.1.8.58748 &gt; 192.168.1.8.55533: Flags [S], seq 2331897419, win 65535, options [mss 16344,nop,wscale 6,nop,nop,TS val 261991443 ecr 0,sackOK,eol], length 0
23:15:44.641261 IP 192.168.1.8.55533 &gt; 192.168.1.8.58748: Flags [S.], seq 3403812509, ack 2331897420, win 65535, options [mss 16344,nop,wscale 6,nop,nop,TS val 261991443 ecr 261991443,sackOK,eol], length 0
23:15:44.641270 IP 192.168.1.8.58748 &gt; 192.168.1.8.55533: Flags [.], ack 1, win 6379, options [nop,nop,TS val 261991443 ecr 261991443], length 0
23:15:44.641279 IP 192.168.1.8.55533 &gt; 192.168.1.8.58748: Flags [.], ack 1, win 6379, options [nop,nop,TS val 261991443 ecr 261991443], length 0
23:15:44.644808 IP 192.168.1.8.58748 &gt; 192.168.1.8.55533: Flags [.], seq 1:16333, ack 1, win 6379, options [nop,nop,TS val 261991446 ecr 261991443], length 16332
23:15:44.644812 IP 192.168.1.8.58748 &gt; 192.168.1.8.55533: Flags [P.], seq 16333:22329, ack 1, win 6379, options [nop,nop,TS val 261991446 ecr 261991443], length 5996
23:15:44.644835 IP 192.168.1.8.55533 &gt; 192.168.1.8.58748: Flags [.], ack 22329, win 6030, options [nop,nop,TS val 261991446 ecr 261991446], length 0</code></pre>
</div>
<ol>
    <li>第三行中，客户端发起连接请求，options参数中有一个mss 16344的参数，就表示连接建立后，客户端能接收的最大TCP报文大小，超过后就会被拆包分开传送；</li>
    <li>前四行都是两端的连接过程；</li>
    <li>第五行客户端口58748向服务端口55533传输了16332字节大小的数据包；</li>
    <li>第六行客户端口58748向服务端口55533传输了5996字节大小的数据包；</li>
</ol>
<p>从抓包过程就能看出，客户端发送一个字符串，被拆成了两个TCP数据报进行传输。</p>
<h3>解决方案</h3>
<p>对于粘包的情况，要对粘在一起的包进行拆包。对于拆包的情况，要对被拆开的包进行粘包，即将一个被拆开的完整应用包再组合成一个完整包。比较通用的做法就是每次发送一个应用数据包前在前面加上四个字节的包长度值，指明这个应用包的真实长度。如下图就是应用数据包格式。
</p>
<figure data-size="normal"><img src="https://pic1.zhimg.com/v2-bb7b769a7187cd5fc146c79c5ae9d208_b.jpg" data-caption=""
        data-size="normal" data-rawwidth="614" data-rawheight="360" class="origin_image zh-lightbox-thumb" width="614"
        data-original="https://pic1.zhimg.com/v2-bb7b769a7187cd5fc146c79c5ae9d208_r.jpg"></figure>
<p class="ztext-empty-paragraph"><br></p>
<p>下面我修改前文的代码示例，来实现解决拆包粘包问题，有两种实现方式： 1. 一种方式是引入netty库，netty封装了多种拆包粘包的方式，只需要对接口熟悉并调用即可，减少自己处理数据协议的繁琐流程； 2.
    自己写协议封装和解析流程，相当于实现了netty库拆粘包的简易版本，本篇文章是为了学习需要，就通过这个方式实现：</p>
<p>a. 客户端。每次发送一个字符串前，都将字符串转为字节数组，在原数据字节数组前再加上一个四个字节的代表该数据的长度，然后将组合的字节数组发送出去；</p>
<div class="highlight">
    <pre><code class="language-java"><span class="kd">public</span> <span class="kd">class</span> <span class="nc">SocketClient</span> <span class="o">{</span>

    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">main</span><span class="o">(</span><span class="n">String</span><span class="o">[]</span> <span class="n">args</span><span class="o">)</span> <span class="kd">throws</span> <span class="n">Exception</span> <span class="o">{</span>
        <span class="c1">// 要连接的服务端IP地址和端口
</span><span class="c1"></span>        <span class="n">String</span> <span class="n">host</span> <span class="o">=</span> <span class="s">"127.0.0.1"</span><span class="o">;</span>
        <span class="kt">int</span> <span class="n">port</span> <span class="o">=</span> <span class="n">55533</span><span class="o">;</span>
        <span class="c1">// 与服务端建立连接
</span><span class="c1"></span>        <span class="n">Socket</span> <span class="n">socket</span> <span class="o">=</span> <span class="k">new</span> <span class="n">Socket</span><span class="o">(</span><span class="n">host</span><span class="o">,</span> <span class="n">port</span><span class="o">);</span>
        <span class="c1">// 建立连接后获得输出流
</span><span class="c1"></span>        <span class="n">OutputStream</span> <span class="n">outputStream</span> <span class="o">=</span> <span class="n">socket</span><span class="o">.</span><span class="na">getOutputStream</span><span class="o">();</span>
        <span class="n">String</span> <span class="n">message</span> <span class="o">=</span> <span class="s">"这是一个整包!!!"</span><span class="o">;</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">contentBytes</span> <span class="o">=</span> <span class="n">message</span><span class="o">.</span><span class="na">getBytes</span><span class="o">(</span><span class="s">"UTF-8"</span><span class="o">);</span>
        <span class="n">System</span><span class="o">.</span><span class="na">out</span><span class="o">.</span><span class="na">println</span><span class="o">(</span><span class="s">"contentBytes.length = "</span> <span class="o">+</span> <span class="n">contentBytes</span><span class="o">.</span><span class="na">length</span><span class="o">);</span>
        <span class="kt">int</span> <span class="n">length</span> <span class="o">=</span> <span class="n">contentBytes</span><span class="o">.</span><span class="na">length</span><span class="o">;</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">lengthBytes</span> <span class="o">=</span> <span class="n">Utils</span><span class="o">.</span><span class="na">int2Bytes</span><span class="o">(</span><span class="n">length</span><span class="o">);</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">resultBytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">4</span> <span class="o">+</span> <span class="n">length</span><span class="o">];</span>
        <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">lengthBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">resultBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">lengthBytes</span><span class="o">.</span><span class="na">length</span><span class="o">);</span>
        <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">contentBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">resultBytes</span><span class="o">,</span> <span class="n">4</span><span class="o">,</span> <span class="n">contentBytes</span><span class="o">.</span><span class="na">length</span><span class="o">);</span>

        <span class="k">for</span> <span class="o">(</span><span class="kt">int</span> <span class="n">i</span> <span class="o">=</span> <span class="n">0</span><span class="o">;</span> <span class="n">i</span> <span class="o">&lt;</span> <span class="n">10</span><span class="o">;</span> <span class="n">i</span><span class="o">++)</span> <span class="o">{</span>
            <span class="n">outputStream</span><span class="o">.</span><span class="na">write</span><span class="o">(</span><span class="n">resultBytes</span><span class="o">);</span>
        <span class="o">}</span>
        <span class="n">Thread</span><span class="o">.</span><span class="na">sleep</span><span class="o">(</span><span class="n">20000</span><span class="o">);</span>
        <span class="n">outputStream</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">socket</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
    <span class="o">}</span>
<span class="o">}</span>
<span class="kd">public</span> <span class="kd">final</span> <span class="kd">class</span> <span class="nc">Utils</span> <span class="o">{</span>
    <span class="c1">//int数值转为字节数组
</span><span class="c1"></span>    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">byte</span><span class="o">[]</span> <span class="nf">int2Bytes</span><span class="o">(</span><span class="kt">int</span> <span class="n">i</span><span class="o">)</span> <span class="o">{</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">result</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">4</span><span class="o">];</span>
        <span class="n">result</span><span class="o">[</span><span class="n">0</span><span class="o">]</span> <span class="o">=</span> <span class="o">(</span><span class="kt">byte</span><span class="o">)</span> <span class="o">(</span><span class="n">i</span> <span class="o">&gt;&gt;</span> <span class="n">24</span> <span class="o">&amp;</span> <span class="n">0xFF</span><span class="o">);</span>
        <span class="n">result</span><span class="o">[</span><span class="n">1</span><span class="o">]</span> <span class="o">=</span> <span class="o">(</span><span class="kt">byte</span><span class="o">)</span> <span class="o">(</span><span class="n">i</span> <span class="o">&gt;&gt;</span> <span class="n">16</span> <span class="o">&amp;</span> <span class="n">0xFF</span><span class="o">);</span>
        <span class="n">result</span><span class="o">[</span><span class="n">2</span><span class="o">]</span> <span class="o">=</span> <span class="o">(</span><span class="kt">byte</span><span class="o">)</span> <span class="o">(</span><span class="n">i</span> <span class="o">&gt;&gt;</span> <span class="n">8</span> <span class="o">&amp;</span> <span class="n">0xFF</span><span class="o">);</span>
        <span class="n">result</span><span class="o">[</span><span class="n">3</span><span class="o">]</span> <span class="o">=</span> <span class="o">(</span><span class="kt">byte</span><span class="o">)</span> <span class="o">(</span><span class="n">i</span> <span class="o">&amp;</span> <span class="n">0xFF</span><span class="o">);</span>
        <span class="k">return</span> <span class="n">result</span><span class="o">;</span>
    <span class="o">}</span>
    <span class="c1">//字节数组转为int数值
</span><span class="c1"></span>    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">int</span> <span class="nf">bytes2Int</span><span class="o">(</span><span class="kt">byte</span><span class="o">[]</span> <span class="n">bytes</span><span class="o">){</span>
        <span class="kt">int</span> <span class="n">num</span> <span class="o">=</span> <span class="n">bytes</span><span class="o">[</span><span class="n">3</span><span class="o">]</span> <span class="o">&amp;</span> <span class="n">0xFF</span><span class="o">;</span>
        <span class="n">num</span> <span class="o">|=</span> <span class="o">((</span><span class="n">bytes</span><span class="o">[</span><span class="n">2</span><span class="o">]</span> <span class="o">&lt;&lt;</span> <span class="n">8</span><span class="o">)</span> <span class="o">&amp;</span> <span class="n">0xFF00</span><span class="o">);</span>
        <span class="n">num</span> <span class="o">|=</span> <span class="o">((</span><span class="n">bytes</span><span class="o">[</span><span class="n">1</span><span class="o">]</span> <span class="o">&lt;&lt;</span> <span class="n">16</span><span class="o">)</span> <span class="o">&amp;</span> <span class="n">0xFF0000</span><span class="o">);</span>
        <span class="n">num</span> <span class="o">|=</span> <span class="o">((</span><span class="n">bytes</span><span class="o">[</span><span class="n">0</span><span class="o">]</span> <span class="o">&lt;&lt;</span> <span class="n">24</span><span class="o">)</span>  <span class="o">&amp;</span> <span class="n">0xFF000000</span><span class="o">);</span>
        <span class="k">return</span> <span class="n">num</span><span class="o">;</span>
    <span class="o">}</span>
<span class="o">}</span></code></pre>
</div>
<p>b. 服务端。接收到客户端发送过来的字节数组后，先提取前面四个字节转为int值，然后再往后取该int数值长度的字节数，再转为字符串就是客户端端发送过来的数据，详见代码：</p>
<div class="highlight">
    <pre><code class="language-java"><span class="kd">public</span> <span class="kd">class</span> <span class="nc">SocketServer</span> <span class="o">{</span>
    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">main</span><span class="o">(</span><span class="n">String</span><span class="o">[]</span> <span class="n">args</span><span class="o">)</span> <span class="kd">throws</span> <span class="n">Exception</span> <span class="o">{</span>
        <span class="c1">// 监听指定的端口
</span><span class="c1"></span>        <span class="kt">int</span> <span class="n">port</span> <span class="o">=</span> <span class="n">55533</span><span class="o">;</span>
        <span class="n">ServerSocket</span> <span class="n">server</span> <span class="o">=</span> <span class="k">new</span> <span class="n">ServerSocket</span><span class="o">(</span><span class="n">port</span><span class="o">);</span>
        <span class="c1">// server将一直等待连接的到来
</span><span class="c1"></span>        <span class="n">System</span><span class="o">.</span><span class="na">out</span><span class="o">.</span><span class="na">println</span><span class="o">(</span><span class="s">"server将一直等待连接的到来"</span><span class="o">);</span>
        <span class="n">Socket</span> <span class="n">socket</span> <span class="o">=</span> <span class="n">server</span><span class="o">.</span><span class="na">accept</span><span class="o">();</span>
        <span class="c1">// 建立好连接后，从socket中获取输入流，并建立缓冲区进行读取
</span><span class="c1"></span>        <span class="n">InputStream</span> <span class="n">inputStream</span> <span class="o">=</span> <span class="n">socket</span><span class="o">.</span><span class="na">getInputStream</span><span class="o">();</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">bytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">1024</span> <span class="o">*</span> <span class="n">128</span><span class="o">];</span>
        <span class="kt">int</span> <span class="n">len</span><span class="o">;</span>
        <span class="kt">byte</span><span class="o">[]</span> <span class="n">totalBytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[]{};</span>
        <span class="kt">int</span> <span class="n">totalLength</span> <span class="o">=</span> <span class="n">0</span><span class="o">;</span>
        <span class="k">while</span> <span class="o">((</span><span class="n">len</span> <span class="o">=</span> <span class="n">inputStream</span><span class="o">.</span><span class="na">read</span><span class="o">(</span><span class="n">bytes</span><span class="o">))</span> <span class="o">!=</span> <span class="o">-</span><span class="n">1</span><span class="o">)</span> <span class="o">{</span>
            <span class="c1">//1. 将读取的数据和上一次遗留的数据拼起来
</span><span class="c1"></span>            <span class="kt">int</span> <span class="n">tempLength</span> <span class="o">=</span> <span class="n">totalLength</span><span class="o">;</span>
            <span class="n">totalLength</span> <span class="o">=</span> <span class="n">len</span> <span class="o">+</span> <span class="n">totalLength</span><span class="o">;</span>
            <span class="kt">byte</span><span class="o">[]</span> <span class="n">tempBytes</span> <span class="o">=</span> <span class="n">totalBytes</span><span class="o">;</span>
            <span class="n">totalBytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">totalLength</span><span class="o">];</span>
            <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">tempBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">totalBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">tempLength</span><span class="o">);</span>
            <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">bytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">totalBytes</span><span class="o">,</span> <span class="n">tempLength</span><span class="o">,</span> <span class="n">len</span><span class="o">);</span>
            <span class="k">while</span> <span class="o">(</span><span class="n">totalLength</span> <span class="o">&gt;</span> <span class="n">4</span><span class="o">)</span> <span class="o">{</span>
                <span class="kt">byte</span><span class="o">[]</span> <span class="n">lengthBytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">4</span><span class="o">];</span>
                <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">totalBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">lengthBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">lengthBytes</span><span class="o">.</span><span class="na">length</span><span class="o">);</span>
                <span class="kt">int</span> <span class="n">contentLength</span> <span class="o">=</span> <span class="n">Utils</span><span class="o">.</span><span class="na">bytes2Int</span><span class="o">(</span><span class="n">lengthBytes</span><span class="o">);</span>
                <span class="c1">//2. 如果剩下数据小于数据头标的长度，则出现拆包，再次获取数据连接
</span><span class="c1"></span>                <span class="k">if</span> <span class="o">(</span><span class="n">totalLength</span> <span class="o">&lt;</span> <span class="n">contentLength</span> <span class="o">+</span> <span class="n">4</span><span class="o">)</span> <span class="o">{</span>
                    <span class="k">break</span><span class="o">;</span>
                <span class="o">}</span>
                <span class="c1">//3. 将数据头标的指定长度的数据取出则为应用数据
</span><span class="c1"></span>                <span class="kt">byte</span><span class="o">[]</span> <span class="n">contentBytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">contentLength</span><span class="o">];</span>
                <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">totalBytes</span><span class="o">,</span> <span class="n">4</span><span class="o">,</span> <span class="n">contentBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">contentLength</span><span class="o">);</span>
                <span class="c1">//注意指定编码格式，发送方和接收方一定要统一，建议使用UTF-8
</span><span class="c1"></span>                <span class="n">String</span> <span class="n">content</span> <span class="o">=</span> <span class="k">new</span> <span class="n">String</span><span class="o">(</span><span class="n">contentBytes</span><span class="o">,</span> <span class="s">"UTF-8"</span><span class="o">);</span>
                <span class="n">System</span><span class="o">.</span><span class="na">out</span><span class="o">.</span><span class="na">println</span><span class="o">(</span><span class="s">"contentLength = "</span> <span class="o">+</span> <span class="n">contentLength</span> <span class="o">+</span> <span class="s">", content: "</span> <span class="o">+</span> <span class="n">content</span><span class="o">);</span>
                <span class="c1">//4. 去掉已读取的数据
</span><span class="c1"></span>                <span class="n">totalLength</span> <span class="o">-=</span> <span class="o">(</span><span class="n">4</span> <span class="o">+</span> <span class="n">contentLength</span><span class="o">);</span>
                <span class="kt">byte</span><span class="o">[]</span> <span class="n">leftBytes</span> <span class="o">=</span> <span class="k">new</span> <span class="kt">byte</span><span class="o">[</span><span class="n">totalLength</span><span class="o">];</span>
                <span class="n">System</span><span class="o">.</span><span class="na">arraycopy</span><span class="o">(</span><span class="n">totalBytes</span><span class="o">,</span> <span class="n">4</span> <span class="o">+</span> <span class="n">contentLength</span><span class="o">,</span> <span class="n">leftBytes</span><span class="o">,</span> <span class="n">0</span><span class="o">,</span> <span class="n">totalLength</span><span class="o">);</span>
                <span class="n">totalBytes</span> <span class="o">=</span> <span class="n">leftBytes</span><span class="o">;</span>
            <span class="o">}</span>
        <span class="o">}</span>
        <span class="n">inputStream</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">socket</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
        <span class="n">server</span><span class="o">.</span><span class="na">close</span><span class="o">();</span>
    <span class="o">}</span>
<span class="o">}</span></code></pre>
</div>
<p>c. 打印结果：</p>
<div class="highlight">
    <pre><code class="language-text">server将一直等待连接的到来
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!
contentLength = 21, content: 这是一个整包!!!</code></pre>
</div>
<p>客户端连续发送十个字符串，服务端也收到了分开的十个字符串，不再出现多个数据包连在一起的情况了。</p></span>