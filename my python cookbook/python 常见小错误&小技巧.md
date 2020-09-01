# list append return none
a = []
a = a.append(1)
a is None  #True


a = []
a = a.append(1)
a is None  #True


# how to be elegant & graceful
```python
# 如何优雅的将
# a = “123” 变成 a = '["123"]'

# 下面用了4行去做
temp = []
a = "123"
temp.append(a)
a = str(temp)

# 下面一行实现了功能，但是感觉不够优雅
a = '[' + "'" + a + "'" + ']'
```

# cpython 中的细节
```python
a = "123"
b = "123"
a is b     #True

a = "123" * 100
b = "123" * 100
a is b     #False
```