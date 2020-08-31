# User-Defined Variables
在MySQL中，我们可以将一个值或一个查询结果保存的一个用户自定义的变量中，然后在后面的语句在应用。

# SET定义变量
SET @var_name := expr [, @var_name = expr ] ....
SET @var_name = expr [, @var_name = expr ] ....


注意：
这里用 ":=" or "="都行，但是"="在其他statement语句中有相等的意思，容易混淆，有时也会出错。强烈建议用 ":="。


# 入门
入门请看这篇文章，[文章链接](https://www.mysqltutorial.org/mysql-variables/)



# 对比
与 User-Defined Variables 形成对比的是 Server System Variables。