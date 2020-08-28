分组后取一条数据是一种非常常见的数据请求，那么相应的sql语句应该如何书写呢？

举例：
学生成绩表格，按照班级分组，取出每个班级的第一名。  
学生成绩表格，按照班级分组，取出每个班级的前10名。  

更加符合工业届的例子：
bilibili有30多个分区，取出每个分区中前三名的up主
知乎有多个话题分类，取出每个话题下的前三名组成知乎日报

更更常见的场景：
用户登陆信息记录表，每当用户登陆，都在这张表中记录一条信息。  
现在运营人员希望你能够提供 每个用户的最近一次登陆时间 便于他们进行数据分析和运营。

举了很多例子，你是不是对这种 sql 语句的编写场景有了一定认知呢，下面我们就以一个具体的例子和场景进行 sql 语句编写的训练。

1. 数据如下  

| name | dep | age |  
| ---    | ---   |--- |
| Bob  | 1     | 32  |
| Jill | 1     | 34  |
| Shawn| 1     | 42  |
| Jake | 2     | 29  |
| Paul | 2     | 36  |
| Laura| 2     | 39  |

dep 是 department 的缩写
2. 以 mysql 最新版数据库作为测试数据库
```bash
mysql> select version();
+-----------+
| version() |
+-----------+
| 8.0.21    |
+-----------+
1 row in set (0.00 sec)
```
3. 相关 DDL 和 DML 语句
```sql
create database my_test;

use my_test;

create table people
(
    id   int primary key auto_increment,
    name varchar(50),
    dep  int,
    age  int
);

insert into people (name, dep, age) values ("Bob", 1, 32);
insert into people (name, dep, age) values ("Jill", 1, 34);
insert into people (name, dep, age) values ("Shawn", 1, 42);
insert into people (name, dep, age) values ("Jake", 2, 29);
insert into people (name, dep, age) values ("Paul", 2, 36);
insert into people (name, dep, age) values ("Laura", 2, 39);
```

4. 终于来到了最激动人心的时刻，可以解决我们提出来的问题了

如何取出每个 department 中年龄最大
的
的用户

